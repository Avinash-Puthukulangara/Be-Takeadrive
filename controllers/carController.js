import mongoose from "mongoose";
import Car from "../models/carModel.js";
import { cloudinaryInstance } from "../config/cloudinary.js";
import Dealer from "../models/dealerModel.js";


export const createCar = async (req,res,next)=> {
        try {
          const { name, model, carnumber, fueltype, transmissiontype, seatcapacity, rent } = req.body;
      
          if (!name || !model || !carnumber || !fueltype || !transmissiontype || !seatcapacity || !rent) {
            return res.status(400).json({ error: 'All fields are required' });
          }
      

          if (!req.file) {
            return res.status(400).json({ success: "false", message: "No file uploaded" });
          }
      
          const result = await cloudinaryInstance.uploader.upload(req.file.path, {
            folder: "carrental cars",
            tags: "image",
            resource_type: "auto",
          });
          
          const carpic = result.secure_url;
          const carpicPublicId = result.public_id;
      
          const carExist = await Car.findOne({ carnumber });
          if (carExist) {
            return res.status(400).json({ error: 'Car already exists' });
          }

          const dealerId = req.user.id;
      
          const newCar = new Car({
            name,
            model,
            carnumber,
            fueltype,
            transmissiontype,
            seatcapacity,
            rent,
            carpic,
            carpicPublicId,
            dealer: dealerId
          });
      

          const savedCar = await newCar.save();
      
          if (savedCar) {
            await Dealer.findByIdAndUpdate(dealerId, {
              $push: { cars: savedCar._id } 
            });
            return res.status(200).json({ success: "true", message: "Car saved successfully", car: savedCar });

          }

          return res.status(400).json({ success: "false", error: "Error in saving car" });
      
        } catch (error) {
          console.log(error);
          return res.status(500).json({ success: "false", error: error.message || 'Internal Server Error' });
        }
}
      
export const getAllCars = async (req,res,next)=>{
    try {
        const carsList = await Car.find();

        return res.json({ success:"true",message: "Cars list fetched", data: carsList });
    } catch (error) {
        console.log(error)
        return res.status(error.status || 500).json({error: error.message || 'Internal Server Error'})
    }
}

export const fetchCardetails = async (req, res, next) => {
    try {
        const { carId } = req.params;

        const carDetails = await Car.findOne({_id:carId});

        return res.json({ success:"true",message: "Car details fetched", data: carDetails });
    } catch (error) {
        console.log(error);
        return res.status(error.statusCode || 500).json({success:"false",error: error.message || "Internal server error"});
    }
}

export const updateCar = async (req, res, next) => {
    try {

        const {carId} = req.params;
        const { name,model,carnumber,fueltype,transmissiontype,seatcapacity,carpic,rent } = req.body;
        
        const carExist = await Car.findById(carId);

        if(!carExist){
           return res.status(404).json({message:"Car not found"})
        }

        const userId = req.user.id; 
        const userRole = req.user.role; 

        if (userRole !== 'admin' && carExist.dealer.toString() !== userId) {
            return res.status(403).json({ message: "You are not authorized to update this car" });
        }

        let carpicnew = carExist.carpic
        let carpicPublicId = carExist.carpicPublicId;

        if(req.file){
            if (carpicPublicId) {
                await cloudinaryInstance.uploader.destroy(carpicPublicId);
            }
            const result = await cloudinaryInstance.uploader.upload(req.file.path, {
                folder: "carrental cars",
                tags: "car",
                resource_type: "auto",
            })
            carpicnew = result.secure_url;
            carpicPublicId = result.public_id
        }

        const carUpdated = await Car.findByIdAndUpdate(carId,{ 
            name,
            model,
            carnumber,
            fueltype,
            transmissiontype,
            seatcapacity,
            carpic: carpicnew,
            carpicPublicId: carpicPublicId,
            rent
        },{new:true})

        res.json({ success:"true",message: "Car updated successfully", data: carUpdated });
    } catch (error) {
        console.log(error);
        res.status(error.statusCode || 500).json({success:"false",error: error.message || "Internal server error"});
    }
}

export const deleteCar = async (req, res, next) => {
    try {
        const { carId } = req.params;
        const carDetails = await Car.findById(carId);
        
        if (!carDetails) {
            return res.status(404).json({ message: "Car not found" });
        }
        
        const carpicPublicId = carDetails.carpicPublicId;

        const userId = req.user.id;
        const userRole = req.user.role;
        const dealerId = carDetails.dealer;
        
        if (userRole !== 'admin' && dealerId.toString() !== userId) {
            return res.status(403).json({ message: "You are not authorized to delete this car" });
        }
        
        await Car.findByIdAndDelete(carId);
        
        if (carpicPublicId) {
            await cloudinaryInstance.uploader.destroy(carpicPublicId);
        }
        
        await Dealer.findByIdAndUpdate(dealerId, {
            $pull: { cars: carId }
        });
        
        return res.status(200).json({ success: "true", message: "Car deleted successfully" });

    } catch (error) {
        console.log(error);
        res.status(error.statusCode || 500).json({success:"false", error:error.message || "Internal server error"});
    }
}
