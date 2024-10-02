import mongoose from "mongoose";
import * as dotenv from "dotenv";
dotenv.config();

export const connectDb = async ()=>{

    try {
        await mongoose.connect(process.env.DB_URL);
        console.log("DB connected Successfully");
    } catch (error) {
        console.log("Error connecting to DB");
    }

}