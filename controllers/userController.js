import User  from '../models/userModel.js'
import bcrypt from 'bcrypt'
import { generateToken } from '../utils/token.js'
import { cloudinaryInstance } from '../config/cloudinary.js';

export const signupUser = async (req,res,next)=>{
    try {
        const { name,email,password,age,phone,address,userpic } = req.body;

        if(!name || !email || !password || !age || !phone || !address){
            return res.status(400).json({error: 'All fields are required'})
        }

        const userExist = await User.findOne({email})

        if(userExist){
            return res.status(400).json({error: 'User already exists'})
        }

        const result = await cloudinaryInstance.uploader.upload('https://static.thenounproject.com/png/363633-200.png', {
            folder: "carrental users",
            tags: "image",
            resource_type: "auto",
        })
        
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const userpicresult = result.secure_url
        const userpicPublicId = result.public_id

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            age,
            phone,
            address,
            userpic: userpicresult,
            userpicPublicId
        })

        const savedUser = await newUser.save()

        if(savedUser){
            const token = await generateToken(savedUser._id)

            res.cookie("token",token)
            return res.status(200).json({success:"true",message: "User Signed up successfully"})
        }
        return res.status(400).json({success:"false",error: "Error in User Saving"})

    } catch (error) {
        console.log(error)
        res.status(error.status || 500).json({success:"false",error: error.message || 'Internal Server Error'})
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
        return res.status(200).json({success:"true",message:"User logged in Successfully"})

    } catch (error) {
        console.log(error)
        res.status(error.status || 500).json({success:"false",error: error.message || 'Internal Server Error in Login'})
    }
}

export const fetchUser = async (req,res,next)=>{
    try {
        
        const {user} = req
        const userData = await User.findById(user.id).select('-password')
        res.status(200).json({success:"true",message:"Fetched user data", userData})

    } catch (error) {
        console.log(error)
        res.status(error.status || 500).json({success:"false",error: error.message || 'Internal Server Error'})
    }
}

export const editUser = async (req,res,next)=>{
    try {
        const {userId} = req.params
        const { name,email,password,age,phone,address,userpic } = req.body;

        const userExist = await User.findById(userId);

        if(!userExist){
           return res.status(404).json({message:"User not found"})
        }

        let userpicnew = userExist.userpic;
        let userpicPublicId = userExist.userpicPublicId

        if(req.file){
            if (userpicPublicId) {
                await cloudinaryInstance.uploader.destroy(userpicPublicId);
            }
        const result = await cloudinaryInstance.uploader.upload(req.file.path, {
            folder: "carrental users",
            tags: "image",
            resource_type: "auto"
          });
          userpicnew = result.secure_url;
          userpicPublicId = result.public_id;
        }
        
        const userUpdated = await User.findByIdAndUpdate(userId,{ 
            name,
            email,
            password,
            age,
            phone,
            address,
            userpic: userpicnew,
            userpicPublicId: userpicPublicId
        },{new:true}).select('-password')
        
        res.json({ success:"true",message: "User data updated successfully", data: userUpdated });

    } catch (error) {
        console.log(error)
        res.status(error.status || 500).json({success:"false",error: error.message || 'Internal Server Error'})
    }

}

export const logoutUser = async (req,res,next)=>{
    try {
        
        res.clearCookie('token')
        res.status(200).json({success:"true",message:"User logged out Suuccessfully"})

    } catch (error) {
        console.log(error)
        res.status(error.status || 500).json({success:"false",error: error.message || 'Internal Server Error'})
    }
}

export const deleteUser = async (req,res,next)=>{
    try {
        const {userId} = req.params
        const userExist = await User.findById(userId);

        if(!userExist){
            return res.status(404).json({message:"User not found"})
        }

        await User.findByIdAndDelete(userId)

        if (userExist.userpicPublicId) {
            await cloudinaryInstance.uploader.destroy(userExist.userpicPublicId);
        }

        res.status(200).json({ success:"true",message: "User deleted successfully" });

    } catch (error) {

        console.log(error)
        res.status(error.status || 500).json({success:"false",error: error.message || 'Internal Server Error'})

    }
}