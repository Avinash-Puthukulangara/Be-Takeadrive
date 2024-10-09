import { cloudinaryInstance } from "../config/cloudinary.js";


export const imageHandler = async (path)=>{
    try {
        const uploadImage = await cloudinaryInstance.uploader.upload(path)
        return uploadImage.url
    } catch (error) {
        res.status(400).json({message:"Error in image handler"})
    }
}
