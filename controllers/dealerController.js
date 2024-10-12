import Dealer from '../models/dealerModel.js';
import bcrypt from 'bcrypt'
import { adminToken } from '../utils/token.js'
import { cloudinaryInstance } from '../config/cloudinary.js';

//dealer routes
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

        const result = await cloudinaryInstance.uploader.upload('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSlYIVXkXhJL1LoxjfuT10hVwlYmcJoQ9CD0A&s', {
            folder: "carrental dealers",
            tags: "image",
            resource_type: "auto",
        })

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const dealerpicresult = result.secure_url
        const dealerpicPublicId = result.public_id


        const newDealer = new Dealer({
            name,
            email,
            password: hashedPassword,
            phone,
            role:'dealer',
            dealerpic: dealerpicresult,
            dealerpicPublicId
        })

        const savedDealer = await newDealer.save()

        if (savedDealer) {
            let token;
            if (savedDealer.role === 'dealer') {
                token = adminToken(savedDealer._id, 'dealer');
            } else if (savedDealer.role === 'admin') {
                token = adminToken(savedDealer._id, 'admin');
            }
    
            res.cookie("token", token, {
                maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
                httpOnly: true,
                sameSite: "none",
                secure: process.env.NODE_ENV !== "development",
            });
    
            return res.status(200).json({
                success: "true",
                message: `${savedDealer.role.charAt(0).toUpperCase() + savedDealer.role.slice(1)} signed up successfully`
            });
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

        const token = adminToken(dealerExist._id,'dealer')
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
        let dealerpicPublicId = dealerExist.dealerpicPublicId;

        if(req.file){
            if (dealerpicPublicId) {
                await cloudinaryInstance.uploader.destroy(dealerpicPublicId);
            }
            const result = await cloudinaryInstance.uploader.upload(req.file.path, {
                folder: "carrental dealers",
                tags: "image",
                resource_type: "auto"
              });
              dealerpicnew = result.secure_url;
              dealerpicPublicId = result.public_id;
            }

        const dealerUpdated = await Dealer.findByIdAndUpdate(dealerId,{ 
            name,
            email,
            password,
            phone,
            dealerpic: dealerpicnew,
            dealerpicPublicId: dealerpicPublicId
        },{new:true}).select('-password')

        res.json({ success:"true",message: "Dealer data updated successfully", data: dealerUpdated });

    } catch (error) {
        console.log(error)
        res.status(error.status || 500).json({success:"false",error: error.message || 'Internal Server Error'})
    }

}

export const logoutDealer = async (req,res,next)=>{
    try {
        
        res.clearCookie('token')
        res.status(200).json({success:"true",message:"Dealer logged out Successfully"})
    } catch (error) {
        console.log(error)
        res.status(error.status || 500).json({success:"false",error: error.message || 'Internal Server Error'})
    }
}

export const deleteDealer = async (req,res,next)=>{
    try {
        const {dealerId} = req.params
        const dealerExist = await Dealer.findById(dealerId);

        if(!dealerExist){
            return res.status(404).json({message:"Dealer not found"})
        }
        await Dealer.findByIdAndDelete(dealerId)

        if (dealerExist.dealerpicPublicId) {
            await cloudinaryInstance.uploader.destroy(dealerExist.dealerpicPublicId);
        }

        return res.status(200).json({success:"true",message:"Dealer deleted successfully"})

    } catch (error) {
        console.log(error)
        res.status(error.status || 500).json({success:"false",error: error.message || 'Internal Server Error'})

    }
}


//admin routes
export const getallDealers = async (req, res, next)=>{
    try {
        const allDealers = await Dealer.find({role : 'dealer'}).select('-password')
        return res.status(200).json({success:"true", message:"Fetched all dealers" , data: allDealers})
    } catch (error) {
        console.log(error)
        res.status(error.status || 500).json({success:"false",error: error.message || 'Internal Server Error'})
    }
}