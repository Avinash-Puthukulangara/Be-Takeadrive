import User  from '../models/userModel.js'
import bcrypt from 'bcrypt'
import { generatetoken } from '../utils/token.js'

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
            address
        })

        const savedUser = await newUser.save()
        console.log(savedUser)

        if(savedUser){
            const token = await generatetoken(savedUser._id)

            res.cookie("token",token)
            return res.status(200).json({message: "User saved successfully", savedUser})
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

        const token = generatetoken(userExist._id)
        res.cookie("token", token)
        console.log(userExist)
        return res.status(200).json({message:"User logged in Successfully"})
    } catch (error) {
        console.log(error)
        res.status(error.status || 500).json({error: error.message || 'Internal Server Error in Login'})
    }
}

export const fetchUserprofile = async (req,res,next)=>{
    try {
        





    } catch (error) {
        console.log(error)
        res.status(error.status || 500).json({error: error.message || 'Internal Server Error in fetching user profile'})
    }
}