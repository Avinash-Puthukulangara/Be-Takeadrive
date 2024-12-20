import mongoose from "mongoose";

const carSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minLength: 1
    },
    model: {
        type: String,
        required: true,
        enum: ['suv','sedan','hatchback','mpv']
    },
    carnumber:{
        type: String,
        unique: true,
        required:true,
        match: /^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/
    },
    fueltype: {
        type: String,
        required: true,
        enum: ['diesel','petrol']
    },
    transmissiontype: {
        type: String,
        required: true,
        enum: ['automatic','manual']
    },
    seatcapacity: {
        type: Number,
        required: true,
        enum: [5,6,7]
    },
    carpic: {
        type: [String],
        required: true,
    },
    carpicPublicId: {
        type: [String],
        required: true,
    },
    rent: {
        type: Number,
        required: true,
    },
    rentalcharge: { 
        type: Number,
        default: 0,
    },
    carstatus: {
        type: String,
        enum: [ 'approved', 'pending', 'rejected'],
        default: 'pending'
    },
    totalratings: {
        type: Number,
        default: 0,
    },
    overallratings: {
        type: Number,
        default: 0,
    },
    averagerating: {
        type: Number,
        default: 0,
    },
    dealer: {type: mongoose.Types.ObjectId, ref:"Dealer"},
},
    { timestamps:true }
)

const Car = mongoose.model("Car", carSchema);

export default Car;