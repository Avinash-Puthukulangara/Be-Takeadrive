import express from 'express';
import { authDealer } from '../middlewares/authenticateDealer.js';
import { createCar, deleteCar, fetchCardetails, getAllapprovedcars, getAvailablecars, updateCar } from '../controllers/carController.js';
import { uploadMultiple } from '../middlewares/multer.js';
import { authUser } from '../middlewares/authenticateUser.js';
const router = express.Router();


router.post('/createcar',authDealer,uploadMultiple, createCar)
router.put('/updatecar/:carId',authDealer,uploadMultiple, updateCar)
router.post('/availablecars',authUser, getAvailablecars)
router.get('/cardetails/:carId',authUser, fetchCardetails)
router.delete('/deletecar/:carId',authDealer, deleteCar)

router.get('/approvedcarlist', authDealer, getAllapprovedcars)

export { router as carRouter }