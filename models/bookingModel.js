import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
    // startdate: {
    //     type: Date,
    //     required: true
    // },
    // enddate: {
    //     type: Date,
    //     required: true
    // },
    // pickuplocation: {
    //     type: String,
    //     required: true
    // },
    // dropofflocation: {
    //     type: String,
    //     required: true
    // },
    rentalcharge: {
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
    // selectedrange: {
    //     type: String,
    //     enum: [75,100,170,250,320,400,500,650],
    //     default: 75
    // },
    carId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Car',
        required: true
    },
    carname: {
        type: String,
        required: true
    },
    carnumber: {
        type: String,
        required: true
    },
    carbaserent: {
        type: Number,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    username: {
        type: String,
        required: true
    },
    userphone: {
        type: String,
        required: true
    },
    useremail: {
        type: String,
        required: true
    },
    // localstartdate: {
    //     type: String,
    //     required: true
    // },
    // localenddate: {
    //     type: String,
    //     required: true
    // },
}, {timestamps: true});

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;