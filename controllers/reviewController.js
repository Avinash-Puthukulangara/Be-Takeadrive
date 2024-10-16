
import Car from '../models/carModel.js';
import Review from '../models/reviewModel.js';
import Booking from '../models/bookingModel.js';


export const carReview = async (req, res) => {
    try {
                const userId = req.user.id;  
                const bookingId = req.params.bookingId; 
                const { rating, review, carId } = req.body; 
        
                const existingReview = await Review.findOne({
                    userId: userId,
                    carId: carId,
                    bookingId: bookingId 
                });
        
                if (existingReview) {
                    return res.status(400).json({
                        success: false,
                        message: 'You have already reviewed this car for this booking.'
                    });
                }

                const bookingExist = await Booking.findOne({
                    _id: bookingId,  
                    userId: userId,  
                    carId: carId,    
                    bookingstatus: { $ne: 'cancelled' }, 
                })
        
                if (!bookingExist) {
                    return res.status(403).json({
                        success: false,
                        message: 'You cannot review this car.'
                    });
                }

                const carReview = new Review({
                    userId: userId,
                    carId: carId,
                    bookingId: bookingId, 
                    rating: rating,
                    review: review,
                    createdAt: new Date(),
                });
        
                await carReview.save();
        
                const car = await Car.findById(carId);
                if (car) {
                    car.totalRatings += rating;  
                    car.overallratings += 1;   
                    car.averagerating = car.totalRatings / car.overallratings;  
                    await car.save();  
                }
        
                return res.status(201).json({
                    success: true,
                    message: 'Review submitted successfully',
                    data: {
                        review,
                        rating,
                        carId,
                        bookingId
                    }
                });

        

    } catch (error) {
        console.log(error)
        res.status(error.status || 500).json({success:"false",error: error.message || 'Internal Server Error'})
    }
};
