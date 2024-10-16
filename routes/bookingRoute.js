import express from "express";
import { authUser } from "../middlewares/authenticateUser.js";
import { allBookings, bookingCar, cancelBooking, getBookings } from "../controllers/bookingController.js";
import { authAdmin } from "../middlewares/authenticateAdmin.js";
const router = express.Router();

// user controls //
router.post('/bookcar', authUser, bookingCar);
router.get('/mybookings', authUser, getBookings);
router.delete('/cancelbooking/:bookingId', authUser, cancelBooking);

// admin controls //
router.get('/allbookings', authAdmin, allBookings);

export { router as bookingRouter}