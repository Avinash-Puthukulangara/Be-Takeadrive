import { v2 as cloudinary, v2 } from 'cloudinary';

    cloudinary.config({ 
        cloud_name: process.env.CLOUD_NAME, 
        api_key: process.env.CLOUD_API_KEY, 
        api_secret: process.env.CLOUD_API_SECRET
    });

export const cloudinaryInstance = cloudinary