import Booking from "../models/bookingModel.js"
import Car from "../models/carModel.js"
import dayjs from "dayjs"


export const carBooking = async (req,res,next)=> {
    try {
        const { startdate,enddate,pickuplocation,dropofflocation,distanceselected,homedelivery,carId,userId} = req.body

        if(!startdate ||!enddate ||!pickuplocation ||!dropofflocation ||!distanceselected ||!homedelivery){
            return res.status(400).json({error: 'All fields are required'})
        }

        const car = await Car.findById(carId)
        if(!car){
            return res.status(404).json({error: 'Car not found'})
        }

        const startTime = dayjs(startdate).format('hh:mm A'); 
        const endTime = dayjs(enddate).format('hh:mm A'); 
        console.log("Start Time:", startTime);
        console.log("End Time:", endTime); 

        const durationInHours = Math.ceil((endTime - startTime) / (1000 * 60 * 60));

        let baseCost = car.rent;

        if (durationInHours > 8) {
            baseCost += (durationInHours - 8) * 15; 
        }

        const distancePresets = {
            100: 1.2, 
            170: 1.5,  
            250: 2.0,  
            350: 2.5,
            470: 3.0,
            550: 3.5,
            750: 4.0
        };

        let distanceMultiplier = distancePresets[distanceselected] || 1;
        baseCost *= distanceMultiplier;

        if (homedelivery) {
            baseCost += 400; 
        }

        const booking = new Booking({
            userId,
            carId,
            startdate,
            enddate,
            pickuplocation,
            dropofflocation,
            homedelivery,
            totalCost: baseCost,
            distanceselected
        });

        await booking.save();

        res.json({success: true, message: 'Car booked successfully',data: { baseCost, durationInHours, totalCost: baseCost}});

    } catch (error) {
        console.log(error);
        res.status(error.statusCode || 500).json({success:"false", error:error.message || "Internal server error"});
    }
}