import Dealer from '../models/dealerModel.js';
import bcrypt from 'bcrypt'
import { generateToken } from '../utils/token.js'
import { cloudinaryInstance } from '../config/cloudinary.js';

export const signupDealer = async (req,res,next)=>{
    try {
        const { name,email,password,phone,dealerpic } = req.body;

        if(!name || !email || !password || !phone){
            return res.status(400).json({error: 'All fields are required'})
        }

        const dealerExist = await Dealer.findOne({email})

        if(dealerExist){
            return res.status(400).json({error: 'Dealer already exists'})
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newDealer = new Dealer({
            name,
            email,
            password: hashedPassword,
            phone,
            role:'dealer',
            dealerpic
        })

        const savedDealer = await newDealer.save()

        if(savedDealer){
            const token = await generateToken(savedDealer._id,'dealer')

            res.cookie("token",token)
            return res.status(200).json({success:"true",message: "Dealer signed up successfully"})
        }
        return res.status(400).json({success:"false",error: "Error in Dealer Saving"})

    } catch (error) {
        console.log(error)
        res.status(error.status || 500).json({success:"false",error: error.message || 'Internal Server Error'})
    }
}

export const loginDealer = async (req,res,next)=>{
    try {
        const { email,password } = req.body

        if(!email || !password){
            return res.status(400).json({message:"All fields are required"})
        }

        const dealerExist = await Dealer.findOne({email})

        if(!dealerExist){
            return res.status(400).json({message:"Dealer does not exist"})
        }

        const matchPassword = await bcrypt.compare(password,dealerExist.password)

        if(!matchPassword){
            return res.status(400).json({message:"Password doest not match"})
        }

        const token = generateToken(dealerExist._id,'dealer')
        res.cookie("token", token)

        return res.status(200).json({success:"true",message:"Dealer logged in Successfully"})

    } catch (error) {
        console.log(error)
        res.status(error.status || 500).json({success:"false",error: error.message || 'Internal Server Error'})
    }
}

export const fetchDealer = async (req,res,next)=>{
    try {
        
        const {user} = req
        const dealerData = await Dealer.findById(user.id).select('-password')

        res.status(200).json({success:"true",message:"Fetched dealer data", dealerData})

    } catch (error) {
        console.log(error)
        res.status(error.status || 500).json({success:"false",error: error.message || 'Internal Server Error'})
    }
}

export const editDealer = async (req,res,next)=>{
    try {
        const {dealerId} = req.params
        const { name,email,password,phone,dealerpic } = req.body;

        const dealerExist = await Dealer.findById(dealerId);
        
        if(!dealerExist){
           return res.status(404).json({message:"Dealer not found"})
        }

        let dealerpicnew = dealerExist.dealerpic;

        if(req.file){
            const result = await cloudinaryInstance.uploader.upload(req.file.path, {
                folder: "carrental dealers",
                tags: "image",
                resource_type: "auto"
              });
              dealerpicnew = result.secure_url;
            }

        const dealerUpdated = await Dealer.findByIdAndUpdate(dealerId,{ name,email,password,phone,dealerpic: dealerpicnew},{new:true}).select('-password')

        res.json({ success:"true",message: "Dealer data updated successfully", data: dealerUpdated });

    } catch (error) {
        console.log(error)
        res.status(error.status || 500).json({success:"false",error: error.message || 'Internal Server Error'})
    }

}

export const logoutDealer = async (req,res,next)=>{
    try {
        
        res.clearCookie('token')
        res.status(200).json({success:"true",message:"Dealer logged out Suuccessfully"})
    } catch (error) {
        console.log(error)
        res.status(error.status || 500).json({success:"false",error: error.message || 'Internal Server Error'})
    }
}

export const deleteDealer = async (req,res,next)=>{
    try {
        const {dealerId} = req.params

        const dealerExist = await Dealer.findByIdAndDelete(dealerId);
        if(!dealerExist){
            return res.status(404).json({message:"Dealer not found"})
        }

        return res.status(200).json({success:"true",message:"Dealer deleted successfully"})

    } catch (error) {
        console.log(error)
        res.status(error.status || 500).json({success:"false",error: error.message || 'Internal Server Error'})

    }
}