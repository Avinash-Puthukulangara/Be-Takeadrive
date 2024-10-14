import Booking from '../models/bookingModel.js';
import Car from '../models/carModel.js';
import dayjs from 'dayjs';



export const bookingCar = async (req, res, next) => {
    try {
        const { startdate, enddate, pickuplocation, dropofflocation, selectedrange, carId } = req.body;

        const userId = req.user.id;

        if (!startdate || !enddate || !pickuplocation || !dropofflocation || !carId || !userId) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const isCarAvailable = async (carId, startdate, enddate) => {
            const existingBooking = await Booking.findOne({
                carId: carId,
                $or: [
                    { 
                        startdate: { $lt: enddate }, 
                        enddate: { $gt: startdate } 
                    }
                ]
            });
            return !existingBooking;
        };

        const car = await Car.findById(carId);
        if (!car) {
            return res.status(404).json({ error: 'Car not found' });
        }

        const startTime = dayjs(startdate);
        const endTime = dayjs(enddate);

        const available = await isCarAvailable(carId, startTime, endTime);
        if (!available) {
            return res.status(400).json({ error: 'Car is already booked for the selected dates' });
        }

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
            { maxRange: 100, rangeValue: 1.2},
            { maxRange: 170, rangeValue: 1.5},
            { maxRange: 250, rangeValue: 2.0},
            { maxRange: 320, rangeValue: 2.5},
            { maxRange: 400, rangeValue: 3.0},
            { maxRange: 500, rangeValue: 3.5},
            { maxRange: 650, rangeValue: 4.0},
        ]

        const rangeAmount = (selectedrange)=> {
            const presetvalue = rangePresets.find(presetvalue=> selectedrange <= presetvalue.maxRange)
            return presetvalue? presetvalue.rangeValue : 1;
        }

        const rangeAmountcalculated = rangeAmount(selectedrange)
        const rentCost = rangeAmountcalculated* baseCost

        const totalcost = rentCost + timeRange + deliveryCharge;

        const booking = new Booking({
            userId,
            carId,
            startdate,
            enddate,
            pickuplocation,
            dropofflocation,
            selectedrange,
            totalcost
        });

        await booking.save();

        return res.json({ success: "true", message: 'Car booked successfully', data: {
                carId: carId,
                userId: userId,
                durationInHours: durationInHours,
                deliveryCharge: deliveryCharge,
                rentalCharge: totalcost
            }
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};



