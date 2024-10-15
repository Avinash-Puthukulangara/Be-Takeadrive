import express from "express";
import { authUser } from "../middlewares/authenticateUser.js";
import { bookingCar, getBookings } from "../controllers/bookingController.js";
const router = express.Router();


router.post('/bookcar', authUser, bookingCar);
router.get('/mybookings', authUser, getBookings);



export { router as bookingRouter}