import User  from '../models/userModel.js'
import bcrypt from 'bcrypt'
import { generateToken } from '../utils/token.js'
import { imageHandler } from '../utils/imagehandler.js';

export const signupUser = async (req,res,next)=>{
    try {
        const { name,email,password,age,phone,address,userpic } = req.body;

        if(!name || !email || !password || !age || !phone || !address){
            return res.status(400).json({error: 'All fields are required'})
        }

        const userExist = await User.findOne({email})
        console.log(userExist,"")

        if(userExist){
            return res.status(400).json({error: 'User already exists'})
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            age,
            phone,
            address,
            userpic
        })

        const savedUser = await newUser.save()
        console.log(savedUser)

        if(savedUser){
            const token = await generateToken(savedUser._id)

            res.cookie("token",token)
            return res.status(200).json({success:"true",message: "User saved successfully"})
        }
        return res.status(400).json({error: "Error in User Saving"})

    } catch (error) {
        console.log(error)
        res.status(error.status || 500).json({error: error.message || 'Internal Server Error in Signup'})
    }
}

export const loginUser = async (req,res,next)=>{
    try {
        const { email,password } = req.body

        if(!email || !password){
            return res.status(400).json({message:"All fields are required"})
        }

        const userExist = await User.findOne({email})
        if(!userExist){
            return res.status(400).json({message:"User does not exist"})
        }

        const matchPassword = await bcrypt.compare(password,userExist.password)
        if(!matchPassword){
            return res.status(400).json({message:"Password doest not match"})
        }

        const token = generateToken(userExist._id)
        res.cookie("token", token)
        console.log(userExist)
        return res.status(200).json({success:"true",message:"User logged in Successfully"})
    } catch (error) {
        console.log(error)
        res.status(error.status || 500).json({error: error.message || 'Internal Server Error in Login'})
    }
}

export const fetchUserprofile = async (req,res,next)=>{
    try {
        
        const {user} = req
        const userData = await User.findById(user.id).select('-password')
        res.status(200).json({message:"fetched data", userData})

    } catch (error) {
        console.log(error)
        res.status(error.status || 500).json({error: error.message || 'Internal Server Error in fetching user profile'})
    }
}

export const editUserprofile = async (req,res,next)=>{
    try {
        const {userId} = req.params
        const { name,email,password,age,phone,address,userpic } = req.body;
        let imageUrl;

        const userExist = await User.findById(userId);
        console.log(userExist)
        if(!userExist){
           return res.status(404).json({message:"User not found"})
        }

        console.log("image====", req.file);

        if (req.file) {
            imageUrl = await imageHandler(req.file.path)
        }

        console.log(imageUrl,'====imageUrl');

        const userUpdated = await User.findByIdAndUpdate(userId,{ name,email,password,age,phone,address,userpic:imageUrl },{new:true})

        res.json({ message: "User data updated successfully", data: userUpdated });
    } catch (error) {
        console.log(error)
        res.status(error.status || 500).json({error: error.message || 'Internal Server Error in editing user profile'})
    }

}

export const logoutUser = async (req,res,next)=>{
    try {
        
        res.clearCookie('token')
        res.status(200).json({message:"User logged out Suuccessfully"})
    } catch (error) {
        console.log(error)
        res.status(error.status || 500).json({error: error.message || 'Internal Server Error in fetching user profile'})
    }
}

export const deleteUserprofile = async (req,res,next)=>{
    try {
        const {userId} = req.params

        const userExist = await User.findByIdAndDelete(userId);
        if(!userExist){
            return res.status(404).json({message:"User not found"})
        }

        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.log(error)
        res.status(error.status || 500).json({error: error.message || 'Internal Server Error'})

    }
}