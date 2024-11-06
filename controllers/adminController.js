import Dealer from '../models/dealerModel.js';
import bcrypt from 'bcrypt'
import { adminToken } from '../utils/token.js'
import Car from '../models/carModel.js';


export const loginAdmin = async (req,res,next)=>{
    try {
        const { email, password } = req.body;
    

        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
    

        const adminExist = await Dealer.findOne({ email });
    

        if (!adminExist) {
            return res.status(400).json({ message: "Admin does not exist" });
        }
    

        if (adminExist.role !== 'admin') {
            return res.status(403).json({ message: "Admin role not authorised" });
        }
    

        const matchPassword = await bcrypt.compare(password, adminExist.password);
    
     
        if (!matchPassword) {
            return res.status(400).json({ message: "Password does not match" });
        }
    
        const token = adminToken(adminExist._id, 'admin');
        res.cookie("token", token, {
            maxAge: 1 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: "none",
            secure: process.env.NODE_ENV !== "development",
        });
    
        return res.status(200).json({ success: "true", message: "Admin logged in Successfully" });
    


    } catch (error) {

        console.log(error)
        res.status(error.status || 500).json({success:"false",error: error.message || 'Internal Server Error'})
        
    }
}
export const logoutAdmin = async (req,res,next)=>{
    try {
        
        res.clearCookie('token')
        res.status(200).json({success:"true",message:"Admin logged out Successfully"})
    } catch (error) {
        console.log(error)
        res.status(error.status || 500).json({success:"false",error: error.message || 'Internal Server Error'})
    }
}
export const checkAdmin = async (req,res,next)=>{
    try {    
        const {user} = req
        const adminData = await Dealer.findById(user.id).select('-password');
        res.json({  success: "true" ,message: "Admin Authenticated", adminData}); 
    } catch (error) {
        console.log(error)
        res.status(error.status || 500).json({success:"false",error: error.message || 'Internal Server Error'})
    }
}



export const carApproval = async (req,res,next)=>{
    try {
        const { carId } = req.params;

        const car = await Car.findById(carId);
        if (!car || car.carstatus !== 'pending') {
            return res.status(404).json({success:"true",message: 'Already approved car / Car not found for approval'});
        }

        car.carstatus = 'approved';
        await car.save();

        return res.status(200).json({success: true, message: 'Car approved successfully'})

    } catch (error) {
        console.log(error)
        res.status(error.status || 500).json({success:"false",error: error.message || 'Internal Server Error'})
    }
}

export const carPending = async (req,res,next)=>{
    try {

        const pendingCars = await Car.find({ carstatus: 'pending' });

        if (pendingCars.length === 0) {
            return res.status(200).json({ message: "No pending cars" });
        }

        return res.status(200).json({ success: true, message: "Pending cars list", cars: pendingCars });

    } catch (error) {

        console.log(error)
        res.status(error.status || 500).json({success:"false",error: error.message || 'Internal Server Error'})
    }
}

export const carRejection = async (req,res,next)=>{
  try{
    const { carId } = req.params;
    const car = await Car.findById(carId);

    if (!car || car.carstatus !== 'pending' && car.carstatus !== 'approved') {
        return res.status(404).json({success:"true",message: 'Car not found. --rejection--'});
    }

    car.carstatus = 'rejected';
    await car.save();

    return res.status(200).json({success: true, message: 'Car rejected for some reason'})

  } catch (error) {
    console.log(error)
    res.status(error.status || 500).json({success:"false",error: error.message || 'Internal Server Error'})
  }
}