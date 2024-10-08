import User  from '../models/userModel.js'

export const create = async (req,res,next)=>{
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

        const newUser = new User({
            name,
            email,
            password,
            age,
            phone,
            address
        })

        const savedUser = await newUser.save()
        console.log(savedUser)
        if(savedUser){
            return res.status(200).json({message: "User saved successfully", savedUser})
        }
        return res.status(400).json({error: "Error in User Saving"})




    } catch (error) {
        console.log(error)
        res.status(error.status || 500).json({error: error.message || 'Internal Server Error'})
    }
}