import express from "express";
import { authUser } from "../middlewares/authenticateUser.js";
import { bookingCar } from "../controllers/bookingController.js";
const router = express.Router();


router.post('/bookcar', authUser, bookingCar);



export { router as bookingRouter}