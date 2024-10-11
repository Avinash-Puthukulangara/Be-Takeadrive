import mongoose from "mongoose";

const dealerSchema = new mongoose.Schema({
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
    role: {
        type: String,
        required: true,
        enum: ['dealer','admin']
    },
    dealerpic: {
        type: String,
        default: 'https://freesvg.org/img/abstract-user-flat-4.png'
    },
    dealerpicPublicId: {
        type: String,
        required: true
    }, 
    cars: [{ type: mongoose.Types.ObjectId, ref:'Car'}]
},
    { timestamps: true }
)

const Dealer = mongoose.model("Dealer", dealerSchema);
export default Dealer;