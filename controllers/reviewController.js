
import Car from '../models/carModel.js';
import Review from '../models/reviewModel.js';
import Booking from '../models/bookingModel.js';


export const carReview = async (req, res,next) => {
    try {
        const userId = req.user.id;  
        const bookingId = req.params.bookingId; 
        const { rating, review, carId } = req.body; 
        
        const existingReview = await Review.findOne({
            userId: userId,
            carId: carId,
        });
        
        if (existingReview) {
            return res.status(400).json({
                success: "false",
                message: "You can review a car Once."});
        }

        const booking = await Booking.findById(bookingId);
        const bookingExist = await Booking.findOne({
            _id: bookingId,  
            userId: userId,  
            carId: carId,    
            bookingstatus: { $ne: 'cancelled' }, 
        })
        
        if (!bookingExist) {
            return res.status(403).json({
                success: false, message: 'You cannot review this car.'});
        }

        const carReview = new Review({
            userId: userId,
            carId: carId,
            bookingId:bookingId, 
            rating: rating,
            review: review,
            createdAt: new Date(),
        });
        
        await carReview.save();
        
        const car = await Car.findById(carId);
        if (car) {
            car.totalratings += rating;  
            car.overallratings += 1;   
            car.averagerating = car.totalratings / car.overallratings;  
            await car.save();  
        }
        
        return res.status(201).json({
            success: true,message: 'Review submitted successfully'});
    
    } catch (error) {
        console.log(error)
        res.status(error.status || 500).json({success:"false",error: error.message || 'Internal Server Error'})
    }
};

export const deleteReview = async (req,res,next) => {
    try {
        const userId = req.user.id;
        const reviewId = req.params.reviewId;

        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found.' });
        }

        if (review.userId.toString() !== userId) {
            return res.status(403).json({ success: false, message: 'No permission to delete this review.' });
        }

        await Review.findByIdAndDelete(reviewId);

        const car = await Car.findById(review.carId);
        if (car) {
            car.totalratings -= review.rating; 
            car.overallratings -= 1; 
            car.averagerating = car.overallratings > 0 ? car.totalratings / car.overallratings : 0; 
            await car.save(); 
        }

        return res.status(200).json({
            success: true,
            message: 'Review cancelled successfully.'
        });
    } catch (error) {
        console.log(error)
        res.status(error.status || 500).json({success:"false",error: error.message || 'Internal Server Error'})
    }
}


export const dealerGetreviews = async (req,res,next) => {
    try {
        const dealerId = req.user.id;
        console.log(dealerId)
        if(req.user.role !== 'dealer'){
            return res.status(403).json({ success: "false", message: 'You are not authorized to view reviews.'});
        }

        const dealerCars = await Car.find({ dealerId: dealerId }).select('_id')
        

        if(dealerCars.length === 0) {
            return res.status(200).json({ success: "false", message: 'No cars were found'});
        }

        const carIds = dealerCars.map(car => car._id)

        const reviews = await Review.find({ carId: { $in: carIds }}).populate('carId', 'name model').populate('userId', 'name')

        return res.status(200).json({success:"true",message:"Reviews fetched for your Car", data: reviews})
    } catch (error) {
        console.log(error)
        res.status(error.status || 500).json({success:"false",error: error.message || 'Internal Server Error'})
    }
}




export const allReviews = async (req,res,next) => {
    try {
        const isAdmin = req.user.role === 'admin'

        if(!isAdmin) {
            return res.status(403).json({ success: false, message: 'You are not authorized to view all reviews.' });
        }

        const reviews = await Review.find()

        return res.status(200).json({ success: "true", message: 'All reviews fetched successfully', data: reviews });
    } catch (error) {
        console.log(error)
        res.status(error.status || 500).json({success:"false",error: error.message || 'Internal Server Error'})
    }
}
