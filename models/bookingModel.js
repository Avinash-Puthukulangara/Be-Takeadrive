import mongoose from "mongoose";

const bookingSchema =  mongoose.Schema({
    startdate: {
        type: Date,
        required: true
    },
    enddate: {
        type: Date,
        required: true
    },
    pickuplocation: {
        type: String,
        required: true
    },
    dropofflocation: {
        type: String,
        required: true
    },
    distanceselected: {
        type: Number,
        enum: [75,100,170,250,350,470,550,700],
        required: true
    },
    homedelivery: {
        type: Boolean,
        default: false
    },
    userId : {
        type: mongoose.Types.ObjectId,
        ref: "User"
    },
    carId : {
        type: mongoose.Types.ObjectId,
        ref: "Car"
    }
})

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;