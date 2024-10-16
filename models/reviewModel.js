import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    carId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Car',
        required: true
    },
    review: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 600
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    overallratings: {
        type: Number,
        default: 0,
    },
    averagerating: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const Review = mongoose.model("Review", reviewSchema);
export default Review;