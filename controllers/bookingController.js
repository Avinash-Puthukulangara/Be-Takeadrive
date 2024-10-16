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
        const { carId, startdate, enddate, pickuplocation, dropofflocation, selectedrange, rentalcharge } = req.body;
        
        if (!carId || !startdate || !enddate || !pickuplocation || !dropofflocation || !selectedrange || !rentalcharge) {
            return res.status(400).json({ error: 'All booking fields are required' });
        }
    
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        
        const car = await Car.findById(carId);
        if (!car) {
            return res.status(404).json({ error: 'Car not found' });
        }
        
        const booking = new Booking({
            userId: user._id,
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
            rentalcharge 
        });
        
        const bookedData = await booking.save();
        
        return res.status(201).json({
            success: true,
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
        const bookings = await Booking.find({ userId: userId,bookingstatus: { $in: ['pending', 'confirmed']} });

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
        const bookingId = req.params.bookingId;
        const userId = req.user.id;  
        const isAdmin = req.user.role === 'admin'; 
        
        const booking = await Booking.findById(bookingId);
        console.log(booking)

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.bookingstatus === 'cancelled') {
            return res.status(400).json({ message: 'Booking is already cancelled' });
        }

        if (booking.userId.toString() !== userId && !isAdmin) {
            return res.status(403).json({ message: 'You are not authorized to cancel this booking' });
        }

        booking.bookingstatus = 'cancelled'; 
        await Booking.findByIdAndDelete(bookingId);
        // await booking.save();

        return res.status(200).json({ success:"true",message: 'Booking canceled successfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}


export const allBookings = async (req,res,next) => {
    try {
        const isAdmin = req.user.role === 'admin';
        const bookings = await Booking.find({ bookingstatus: 'confirmed'})

        if (!isAdmin) {
            return res.status(403).json({ message: 'You are not authorized to view all bookings' });
        }

        if(!bookings){
            return res.status(404).json({ message: 'No bookings found' });
        }



        return res.status(200).json({ success: "true", message: "All bookings",
            bookingData: bookings.map(booking => {
                const startDate = dayjs.utc(booking.startdate).tz('Asia/Kolkata').format('DD-MMM-YYYY hh:mm A');
                const endDate = dayjs.utc(booking.enddate).tz('Asia/Kolkata').format('DD-MMM-YYYY hh:mm A');
                
                return {
                    bookingId: booking._id,
                    carName: booking.carname,
                    startDate: startDate,
                    endDate: endDate,
                    rentalCharge: booking.rentalcharge,
                    bookingstatus: booking.bookingstatus
                }
            })
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}

