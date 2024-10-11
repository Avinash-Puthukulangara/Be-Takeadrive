import Dealer from '../models/dealerModel.js';
import bcrypt from 'bcrypt'
import { adminToken } from '../utils/token.js'


export const loginAdmin = async (req,res,next)=>{
    try {
        const { email,password } = req.body

        if(!email || !password){
            return res.status(400).json({message:"All fields are required"})
        }

        const adminExist = await Dealer.findOne({email})

        if(!adminExist){
            return res.status(400).json({message:"Admin does not exist"})
        }

        const matchPassword = await bcrypt.compare(password,adminExist.password)

        if(!matchPassword){
            return res.status(400).json({message:"Password doest not match"})
        }

        const token = adminToken(adminExist._id,'admin')
        res.cookie("token", token)

        return res.status(200).json({success:"true",message:"Admin logged in Successfully", data: adminExist})

    } catch (error) {

        console.log(error)
        res.status(error.status || 500).json({success:"false",error: error.message || 'Internal Server Error'})
        
    }
}