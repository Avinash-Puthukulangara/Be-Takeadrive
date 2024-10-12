import Dealer from '../models/dealerModel.js';
import bcrypt from 'bcrypt'
import { adminToken } from '../utils/token.js'


export const loginAdmin = async (req,res,next)=>{
    try {
        const { email, password } = req.body;
    
        // Check if all required fields are provided
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
    
        // Find the admin by email
        const adminExist = await Dealer.findOne({ email });
    
        // Check if the admin exists
        if (!adminExist) {
            return res.status(400).json({ message: "Admin does not exist" });
        }
    
        // Ensure the user is actually an admin
        if (adminExist.role !== 'admin') {
            return res.status(403).json({ message: "Admin role not authorised" });
        }
    
        // Check if the provided password matches the stored hashed password
        const matchPassword = await bcrypt.compare(password, adminExist.password);
    
        // If passwords don't match, return an error
        if (!matchPassword) {
            return res.status(400).json({ message: "Password does not match" });
        }
    
        const token = adminToken(adminExist._id, 'admin');
        res.cookie("token", token, {
            maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
            httpOnly: true,
            sameSite: "none",
            secure: process.env.NODE_ENV !== "development",
        });
    
        // If everything is successful, return a success response
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