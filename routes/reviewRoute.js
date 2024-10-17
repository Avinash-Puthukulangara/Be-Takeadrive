import express from "express";
import { allReviews, carReview, dealerGetreviews, deleteReview } from "../controllers/reviewController.js";
import { authUser } from "../middlewares/authenticateUser.js";
import { authAdmin } from "../middlewares/authenticateAdmin.js";
import { authDealer } from "../middlewares/authenticateDealer.js";
const router = express.Router();

// user controls //
router.post('/carreview/:bookingId', authUser, carReview)
router.delete('/deletereview/:reviewId', authUser, deleteReview)

// dealer controls //
router.get('/dealerreviews', authDealer, dealerGetreviews)


//admin controls //
router.get('/allreviews/:carId', authAdmin, allReviews)



export { router as reviewRouter}