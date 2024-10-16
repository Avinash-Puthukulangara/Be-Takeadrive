import express from "express";
import { carReview } from "../controllers/reviewController.js";
import { authUser } from "../middlewares/authenticateUser.js";
const router = express.Router();



router.post('/carreview/:bookingId', authUser, carReview)



export { router as reviewRouter}