import User  from '../models/userModel.js'
import bcrypt from 'bcrypt'
import { generateToken } from '../utils/token.js'
import { cloudinaryInstance } from '../config/cloudinary.js';


//user controls//
export const signupUser = async (req,res,next)=>{
    try {
        const { name,email,dob,password,phone } = req.body;

        if(!name || !email || !password || !phone || !dob){
            return res.status(400).json({error: 'All fields are required'})
        }
        if (!req.files || !req.files.lcfrontpic || !req.files.lcbackpic) {
            return res.status(400).json({ success: false, message: 'License front and back pictures are required' });
        }

        const userExist = await User.findOne({email})

        if(userExist){
            return res.status(400).json({error: 'User already exists'})
        }

        const uploadToCloudinary = async (filePath, folder, tags) => {
            return await cloudinaryInstance.uploader.upload(filePath, {
                folder: folder,
                tags: tags,
                resource_type: "auto",
            });
        };

        const defaultUserPicResult = await uploadToCloudinary('https://static.thenounproject.com/png/363633-200.png', "carrental users", "image");
        const licenseFrontResult = await uploadToCloudinary(req.files.lcfrontpic[0].path, "carrental users", "license image");
        const licenseBackResult = await uploadToCloudinary(req.files.lcbackpic[0].path, "carrental users", "license image");

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            phone,
            dob,
            userpic: defaultUserPicResult.secure_url,
            userpicPublicId: defaultUserPicResult.public_id,
            lcfrontpic: licenseFrontResult.secure_url,
            licensefrontpicPublicId: licenseFrontResult.public_id,
            lcbackpic: licenseBackResult.secure_url,
            licensebackpicPublicId: licenseBackResult.public_id,
        })

        const savedUser = await newUser.save()

        if(savedUser){
            const token = await generateToken(savedUser._id)

            res.cookie("token",token ,{
                sameSite:"None",
                secure:true,
                httpOnly:true
            })
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

        res.cookie("token", token, {
            sameSite:"None",
            secure:true,
            httpOnly:true
        })
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
        const { userId } = req.params
        const { name, email, dob, phone, userpic } = req.body;
        const userExist = await User.findById(userId);
        if (!userExist) {
            return res.status(404).json({ message: "User not found" });
        }

        const updateData = {};

        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (phone) updateData.phone = phone; 
        if (dob) updateData.dob = dob;

        let userpicNew = userExist.userpic;
        let userpicPublicId = userExist.userpicPublicId;

        if (req.files && req.files.userpic && req.files.userpic.length > 0) {
            if (userpicPublicId) {
                await cloudinaryInstance.uploader.destroy(userpicPublicId);
            }

            const result = await cloudinaryInstance.uploader.upload(req.files.userpic[0].path, {
                folder: "carrental users",
                tags: "image",
                resource_type: "auto"
            });
            userpicNew = result.secure_url;
            userpicPublicId = result.public_id;
        }

        updateData.userpic = userpicNew; 
        updateData.userpicPublicId = userpicPublicId; 

        const userUpdated = await User.findByIdAndUpdate(userId, updateData, { new: true }).select('-password');

        return res.json({ success: "true", message: "User data updated successfully", data: userUpdated });


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

        const publicIdsToDelete = [
            userExist.userpicPublicId,
            userExist.licensefrontpicPublicId,
            userExist.licensebackpicPublicId
        ];
        
        for (const publicId of publicIdsToDelete) {
            if (publicId) {
                await cloudinaryInstance.uploader.destroy(publicId);
            }
        }

        res.status(200).json({ success:"true",message: "User deleted successfully" });

    } catch (error) {

        console.log(error)
        res.status(error.status || 500).json({success:"false",error: error.message || 'Internal Server Error'})

    }
}

export const checkUser = async (req,res,next) => {
    try {
        
        res.json({  success: "true" ,message: "Authenticated User"});
    
    } catch (error) {
        console.log(error)
        res.status(error.status || 500).json({success:"false",error: error.message || 'Internal Server Error'})
    }
}


//admin controls//
export const getallUsers = async (req, res, next)=>{
    try {
        const isAdmin = req.user.role === 'admin';
        const allUsers = await User.find();

        if (!isAdmin) {
            return res.status(403).json({ message: "Unauthorized Access" });
        }
        if (allUsers.length === 0) {
            return res.status(404).json({ message: "No users found" });
        }
        return res.status(200).json({success:"true", message:"Fetched all Users" , 
            allUsersdata: allUsers.map(user => {
                return {
                    userId: user._id,
                    username: user.name,
                    useremail: user.email,
                    userphone: user.phone,
                    licensefront: user.lcfrontpic,
                    licenseback: user.lcbackpic
                }
            })
        })

    } catch (error) {

        console.log(error)
        res.status(error.status || 500).json({success:"false",error: error.message || 'Internal Server Error'})
    }
}
