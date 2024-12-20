import mongoose from "mongoose";
import Car from "../models/carModel.js";
import { cloudinaryInstance } from "../config/cloudinary.js";
import Dealer from "../models/dealerModel.js";
import Booking from "../models/bookingModel.js";
import dayjs from "dayjs";

export const createCar = async (req,res,next)=> {
        try {
          const { name, model, carnumber, fueltype, transmissiontype, seatcapacity, rent } = req.body;
      
          if (!name || !model || !carnumber || !fueltype || !transmissiontype || !seatcapacity || !rent) {
            return res.status(400).json({ error: 'All fields are required' });
          }
      
          if (!req.files || !req.files.carpic) {
            return res.status(400).json({ success: "false", message: "No files uploaded" });
        }
        
        if (req.files.carpic.length === 0) {
            return res.status(400).json({ success: "false", message: "At least one car image is required" });
        }
        
        const carpics = [];
        const carpicPublicIds = [];
        
        for (const file of req.files.carpic) {
            const result = await cloudinaryInstance.uploader.upload(file.path, {
                folder: "carrental cars",
                tags: "image",
                resource_type: "auto",
            });
        
            carpics.push(result.secure_url);
            carpicPublicIds.push(result.public_id);
        }
      
          const carExist = await Car.findOne({ carnumber });
          if (carExist) {
            return res.status(400).json({ error: 'Car already exists' });
          }

          const dealerId = req.user.id;
          const dealer = await Dealer.findById(dealerId);

          const needSanction = !dealer.carsanction
      
          const newCar = new Car({
            name,
            model,
            carnumber,
            fueltype,
            transmissiontype,
            seatcapacity,
            rent,
            carpic: carpics,
            carpicPublicId: carpicPublicIds,
            dealer: dealerId,
            carstatus: needSanction ? 'pending' : 'approved'
          });
      
          const savedCar = await newCar.save();
      
          if (savedCar) {
            await Dealer.findByIdAndUpdate(dealerId, {
              $push: { cars: savedCar._id }});
          }

          dealer.carstock += 1

          if(dealer.carstock >= 3){
            dealer.carsanction = true
          }

          await dealer.save();

          if(needSanction){
            res.status(200).json({ success: "true", message: "Car saved successfully,needs sanction", car: savedCar });
          }else{
            res.status(200).json({ success: "true", message: "Car saved successfully", car: savedCar });
          }
      
        } catch (error) {
          console.log(error);
          return res.status(500).json({ success: "false", error: error.message || 'Internal Server Error' });
        }
}
      
export const getAvailablecars = async (req,res,next)=>{
    try {
        const { startdate, enddate, pickuplocation, dropofflocation, name, model, fueltype, transmissiontype, seatcapacity, selectedrange} = req.body;

        // if (!startdate || !enddate || !pickuplocation || !dropofflocation) {
        //     return res.status(400).json({ error: 'All fields are required' });
        // }

        const startTime = dayjs(startdate);
        const endTime = dayjs(enddate)
        const bufferTime = startTime.subtract(3, 'hour');
        const durationInHours = endTime.diff(startTime, 'hour', true); 
        
        const bookedCars = await Booking.find({
            carId: { $exists: true }, 
            startdate: { $lt: endTime },  
            enddate: { $gt: bufferTime },    
        }).select('carId');
        
        const bookedCarIds = bookedCars.map(booking => booking.carId);
        
        const carsAvailable = await Car.find({
            carstatus: 'approved',
            ...(name ? { name } : {}),
            ...(model ? { model } : {}),
            ...(fueltype ? { fueltype } : {}),
            ...(transmissiontype ? { transmissiontype } : {}),
            ...(seatcapacity ? { seatcapacity } : {}),
            _id: { $nin: bookedCarIds } 
        });
        
        console.log('Available Cars Count:', carsAvailable.length);
        
        if (carsAvailable.length === 0) {
            return res.status(404).json({ message: 'No cars found with the specified filters and availability' });
        }

        let timeRange = 0;
        if (durationInHours > 8) {
            timeRange = (durationInHours - 8) * 15; 
        }

        let deliveryCharge = 0;
        if (pickuplocation === "Home Delivery" || dropofflocation === 'Home Delivery') {
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

        const allCarsData = await Promise.all(carsAvailable.map(async (car) => {
            const rentCost = rangeAmountcalculated * car.rent;
            const totalcost = Math.round(rentCost + timeRange + deliveryCharge);

            await Car.findByIdAndUpdate(car._id, { rentalcharge: totalcost });

            return {
                _id: car._id,
                name: car.name,
                model: car.model,
                carnumber: car.carnumber,
                fueltype: car.fueltype,
                transmissiontype: car.transmissiontype,
                seatcapacity: car.seatcapacity,
                rent: car.rent,
                carpic: car.carpic,
                dealer: car.dealer,
                rentalcharge: totalcost,
            };
        }));

        return res.json({
            success: 'true',
            message: 'Cars available for the selected dates and locations',
            allCarsdata: allCarsData,
        });

    } catch (error) {
        console.log(error);
        return res.status(error.status || 500).json({ error: error.message || 'Internal Server Error' });
    }
}

export const fetchCardetails = async (req, res, next) => {
    try {
        const { carId } = req.params;
    
        const carDetails = await Car.findById(carId);
    
        if (!carDetails) {
          return res.status(404).json({ success: "false", message: "Car not found." });
        }
    
        return res.json({ success: "true", message: "Car details fetched", data: carDetails });
      } catch (error) {
        console.log(error);
        return res.status(error.statusCode || 500).json({ success: "false", error: error.message || "Internal server error" });
      }
}

export const updateCar = async (req, res, next) => {
    try {

      const { carId } = req.params;
      const { name, model, carnumber, fueltype, transmissiontype, seatcapacity, rent } = req.body;
      
      const carExist = await Car.findById(carId);
      
      if (!carExist) {
          return res.status(404).json({ message: "Car not found" });
      }
      
      const userId = req.user.id;
      const userRole = req.user.role;
      
      if (userRole !== 'admin' && carExist.dealer.toString() !== userId) {
          return res.status(403).json({ message: "You are not authorized to update this car" });
      }
      
      const updateData = {};
   
      if (name) updateData.name = name;
      if (model) updateData.model = model;
      if (carnumber) updateData.carnumber = carnumber;
      if (fueltype) updateData.fueltype = fueltype;
      if (transmissiontype) updateData.transmissiontype = transmissiontype;
      if (seatcapacity) updateData.seatcapacity = seatcapacity;
      if (rent) updateData.rent = rent;
      

      let carpicsnew = carExist.carpic || []; 
      let carpicsPublicIds = carExist.carpicPublicId || [];

      if (req.files && req.files.carpic && req.files.carpic.length > 0) {

          if (carpicsPublicIds.length > 0) {
              for (let publicId of carpicsPublicIds) {
                  await cloudinaryInstance.uploader.destroy(publicId);
              }
          }

          carpicsnew = [];
          carpicsPublicIds = [];

          for (const file of req.files.carpic) {
              const result = await cloudinaryInstance.uploader.upload(file.path, {
                  folder: "carrental cars",
                  tags: "car",
                  resource_type: "auto",
              });
      
              carpicsnew.push(result.secure_url);
              carpicsPublicIds.push(result.public_id);
          }

          updateData.carpic = carpicsnew;
          updateData.carpicPublicId = carpicsPublicIds;
      }
      
      const carUpdated = await Car.findByIdAndUpdate(carId, updateData, { new: true });
      
      res.json({ success: "true", message: "Car updated successfully", data: carUpdated });
    } catch (error) {
        console.log(error);
        res.status(error.statusCode || 500).json({success:"false",error: error.message || "Internal server error"});
    }
}

export const deleteCar = async (req, res, next) => {
    try {
      const { carId } = req.params;
      const car = await Car.findById(carId);
      
      if (!car) {
          return res.status(404).json({ message: "Car not found" });
      }
      
      const userId = req.user.id;
      const userRole = req.user.role;
      const dealerId = car.dealer;
      
      if (userRole !== 'admin' && dealerId.toString() !== userId) {
          return res.status(403).json({ message: "You are not authorized to delete this car" });
      }
      
      const carpicPublicIds = car.carpicPublicId;
      
      if (carpicPublicIds && carpicPublicIds.length > 0) {
          for (let publicId of carpicPublicIds) {
              await cloudinaryInstance.uploader.destroy(publicId);
          }
      }
      
      await Car.findByIdAndDelete(carId);
      
      const dealer = await Dealer.findById(dealerId);
      if (dealer) {
          dealer.carstock = Math.max(dealer.carstock - 1, 0);
          await Dealer.findByIdAndUpdate(dealerId, {
              $pull: { cars: carId },
              carstock: dealer.carstock
          });
      }
      
      return res.status(200).json({ success: "true", message: "Car deleted successfully" });      

    } catch (error) {
        console.log(error);
        res.status(error.statusCode || 500).json({success:"false", error:error.message || "Internal server error"});
    }
}



// for dealer-admin //
export const getAllapprovedcars = async (req,res,next) => {
    try {
        const role = req.user.role;
        const dealerId = req.user.id;

        if(role === "admin"){
            const adminApprovedCars = await Car.find({ carstatus: "approved"})
            return res.status(200).json({success:"true", message:"Fetched all approved cars", approvedCars: adminApprovedCars})
        }else if(role === "dealer"){
            const dealerApprovedCars = await Car.find({ dealer: dealerId ,carstatus: "approved"})
            return res.status(200).json({success:"true", message:"Fetched all approved cars", approvedCars:dealerApprovedCars})
        }else {
            return res.status(401).json({success:"false", message:"Unauthorized access"})
        }

    } catch (error) {
        console.log(error);
        res.status(error.statusCode || 500).json({success:"false", error:error.message || "Internal server error"});
    }
}
