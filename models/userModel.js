import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minLength: 1
    },
    email: {
        type: String,
        required: true,
        unique: true,
        // match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    },
    password: {
        type: String,
        required: true,
        minLength: 8
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        match: /^\d{10}$/
    },
    age: {
        type: Number,
        required: true,
        min: 18
    },
    address: {
        type: String,
        required: true
    },
    userpic: {
        type: String,
        default: 'https://freesvg.org/img/abstract-user-flat-4.png'
    }, 
},
    { timestamps: true }
)

const User = mongoose.model("User", userSchema);
export default User;