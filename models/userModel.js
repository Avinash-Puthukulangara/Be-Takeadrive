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
    dob: {
        type: Date,
        reqired: true
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
    lcfrontpic : {
        type: String,
        required: true
    },
    licensefrontpicPublicId: {
        type: String,
        required: true
    },
    lcbackpic: {
        type: String,
        required: true
    },
    licensebackpicPublicId: {
        type: String,
        required: true
    },
    userpic: {
        type: String,
        default: 'https://freesvg.org/img/abstract-user-flat-4.png'
    }, 
    userpicPublicId: {
        type: String,
        required: true
    }
},
    { timestamps: true }
)

const User = mongoose.model("User", userSchema);
export default User;