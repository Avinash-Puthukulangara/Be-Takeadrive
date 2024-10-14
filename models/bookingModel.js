import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({

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
    totalcost: {
        type: Number,
        required: true
    },
    bookingstatus: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled'],
        default: 'pending'
    },
    paymentstatus: {
        type: String,
        enum: ['pending', 'paid'],
        default: 'pending'
    },
    selectedrange: {
        type: String,
        enum: [75,100,170,250,320,400,500,650],
        default: 75
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    carId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Car',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
}, {timestamps: true});

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;