import mongoose from "mongoose";
import Car from "../models/carModel.js";
import { imageHandler } from "../utils/imagehandler.js";


export const createCar = async (req,res,next)=> {
    try {
        const { name,model,carnumber,fueltype,transmissiontype,seatcapacity,image,rent } = req.body

        // if(!name ||!model ||!carnumber ||!fueltype ||!transmissiontype ||!seatcapacity ||!image ||!rent){
        //     return res.status(400).json({error: 'All fields are required'})
        // }

        const carExist = await Car.findOne({carnumber})
        console.log(carExist,"")

        if(carExist){
            return res.status(400).json({error: 'Car already exists'})
        }

        let imageUrl

        if(req.file){
            imageUrl = await imageHandler(req.file.path)
        }
        console.log(imageUrl,'image')

        const newCar = new Car({
            name,
            model,
            carnumber,
            fueltype,
            transmissiontype,
            seatcapacity,
            image: imageUrl,
            rent
        })

        const  savedCar = await newCar.save()
        console.log(savedCar)

        if(savedCar){
            return res.status(200).json({success:"true",message: "Car saved successfully",savedCar})
        }
        return res.status(400).json({error: "Error in Car Saving"})

    } catch (error) {
        console.log(error)
        res.status(error.status || 500).json({error: error.message || 'Internal Server Error'})
    }
}

export const getAllCars = async (req,res,next)=>{
    try {
        const carsList = await Car.find();

        res.json({ message: "Cars list fetched", data: carsList });
    } catch (error) {
        console.log(error)
        res.status(error.status || 500).json({error: error.message || 'Internal Server Error'})
    }
}

export const fetchCardetails = async (req, res, next) => {
    try {
        const { carId } = req.params;

        const carDetails = await Car.findOne({_id:carId});
        console.log(carDetails)

        res.json({ message: "Car details fetched", data: carDetails });
    } catch (error) {
        console.log(error);
        res.status(error.statusCode || 500).json(error.message || "Internal server error");
    }
}

export const updateCar = async (req, res, next) => {
    try {

        const {carId} = req.params;
        const { name,model,carnumber,fueltype,transmissiontype,seatcapacity,image,rent } = req.body;
        let imageUrl;

        const carExist = await Car.findById(carId);
        if(!carExist){
           return res.status(404).json({message:"Car not found"})
        }

        console.log("image====", req.file);

        if (req.file) {
            imageUrl = await imageHandler(req.file.path)
        }

        console.log(imageUrl,'====imageUrl');

        const carUpdated = await Car.findByIdAndUpdate(carId,{ name,model,carnumber,fueltype,transmissiontype,seatcapacity,image: imageUrl,rent },{new:true})

        res.json({ message: "Car updated successfully", data: carUpdated });
    } catch (error) {
        console.log(error);
        res.status(error.statusCode || 500).json(error.message || "Internal server error");
    }
}

export const deleteCar = async (req, res, next) => {
    try {

        const {carId} = req.params;
        const carDetails = await Car.findByIdAndDelete(carId)

        if(!carDetails){
            return res.status(404).json({message:"Car not found"})
        }

        return res.status(200).json({ message: "Car deleted successfully" });
    } catch (error) {
        console.log(error);
        res.status(error.statusCode || 500).json(error.message || "Internal server error");
    }
}
