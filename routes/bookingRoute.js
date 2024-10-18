import express from "express";
import { authUser } from "../middlewares/authenticateUser.js";
import { allBookings, bookingCar, bookingRevenue, cancelBooking, getBookings } from "../controllers/bookingController.js";
import { authAdmin } from "../middlewares/authenticateAdmin.js";
const router = express.Router();

// user controls //
router.post('/bookcar', authUser, bookingCar);
router.get('/mybookings', authUser, getBookings);
router.delete('/cancelbooking/:bookingId', authUser, cancelBooking);

// admin controls //
router.get('/allbookings', authAdmin, allBookings);
router.get('/bookingrevenue', authAdmin, bookingRevenue);

export { router as bookingRouter}