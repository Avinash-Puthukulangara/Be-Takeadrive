import { populate } from 'dotenv';
import Booking from '../models/bookingModel.js';
import Car from '../models/carModel.js';
import User  from '../models/userModel.js'
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js'
import timezone from 'dayjs/plugin/timezone.js'
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

export const bookingCar = async (req, res, next) => {
    try {
        const { startdate, enddate, pickuplocation, dropofflocation, selectedrange, carId } = req.body;

        const userId = req.user.id;
        const user = await User.findById(userId);
        
        if (!startdate || !enddate || !pickuplocation || !dropofflocation || !carId || !userId) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const isCarAvailable = async (carId, startdate, enddate) => {
            const start = new Date(startdate);
            const end = new Date(enddate);

            const existingBooking = await Booking.findOne({
                carId: carId,
                startdate: { $lt: end },
                enddate: { $gt: start }
            });

            if (existingBooking) {
                return false; 
            }

            const lastBooking = await Booking.findOne({
                carId: carId
            }).sort({ enddate: -1 }); 
            
            if (lastBooking) {
                const lastBookingEndTime = new Date(lastBooking.enddate);
                const timeDifference = (start - lastBookingEndTime) / (1000 * 60 * 60); 

                if (timeDifference < 3) {
                    return false; 
                }
            }
            return true; 
        };
        
        const car = await Car.findById(carId);
        if (!car) {
            return res.status(404).json({ error: 'Car not found' });
        }

        const available = await isCarAvailable(carId, startdate, enddate);
        if (!available) {
            return res.status(400).json({ 
                error: 'Car is already booked / unable within 3 hours of the previous booking'});
        }

        const startTime = dayjs(startdate);
        const endTime = dayjs(enddate);
        const durationInHours = endTime.diff(startTime, 'hour', true); 
        
        let baseCost = car.rent;
        
        let timeRange = 0;
        if (durationInHours > 8) {
            timeRange = (durationInHours - 8) * 15; 
        }

        let deliveryCharge = 0;
        if (pickuplocation === 'homedelivery' || dropofflocation === 'homedelivery') {
            deliveryCharge = 300; 
        }
        
        const rangePresets = [
            { maxRange: 100, rangeValue: 1.2 },
            { maxRange: 170, rangeValue: 1.5 },
            { maxRange: 250, rangeValue: 2.0 },
            { maxRange: 320, rangeValue: 2.5 },
            { maxRange: 400, rangeValue: 3.0 },
            { maxRange: 500, rangeValue: 3.5 },
            { maxRange: 650, rangeValue: 4.0 },
        ];
        
        const rangeAmount = (selectedrange) => {
            const presetvalue = rangePresets.find(preset => selectedrange <= preset.maxRange);
            return presetvalue ? presetvalue.rangeValue : 1;
        };
        
        const rangeAmountcalculated = rangeAmount(selectedrange);
        const rentCost = rangeAmountcalculated * baseCost;
        
        const totalcost = Math.round(rentCost + timeRange + deliveryCharge);

        const booking = new Booking({
            userId,
            username: user.name,
            useremail: user.email,
            userphone: user.phone,
            carId: car._id,
            carname: car.name,
            carnumber: car.carnumber,
            carbaserent: car.rent,
            startdate,
            enddate,
            pickuplocation,
            dropofflocation,
            selectedrange,
            rentalcharge: totalcost
        });
        
        const bookedData = await booking.save();

        return res.json({
            success: "true",
            message: 'Car booked successfully',
            data: bookedData
        });


    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}

export const getBookings = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const bookings = await Booking.find({ userId: userId });

        console.log(bookings)

        if(!userId){
            return res.status(404).json({ message: 'User not authorised to access' });
        }

        if(!bookings){
            return res.status(404).json({ message: 'No bookings found for this user' });
        }


        return res.status(200).json({success: "true", message: "All bookings",
            bookingData: bookings.map(booking => {
                const startDate = dayjs.utc(booking.startdate).tz('Asia/Kolkata').format('DD-MMM-YYYY hh:mm A');
                const endDate = dayjs.utc(booking.enddate).tz('Asia/Kolkata').format('DD-MMM-YYYY hh:mm A');
                
                return {
                    bookingId: booking._id,
                    carName: booking.carname,
                    startDate: startDate,
                    endDate: endDate,
                    rentalCharge: booking.rentalcharge
                }
            })
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}

export const cancelBooking = async (req,res,next) => {
    try {
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}



