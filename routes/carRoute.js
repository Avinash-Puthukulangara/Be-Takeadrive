import express from 'express';
import { authDealer } from '../middlewares/authenticateDealer.js';
import { createCar, deleteCar, fetchCardetails, getAllCars, updateCar } from '../controllers/carController.js';
import { uploadMultiple } from '../middlewares/multer.js';
import { authUser } from '../middlewares/authenticateUser.js';
const router = express.Router();


router.post('/createcar',authDealer,uploadMultiple, createCar)
router.put('/updatecar/:carId',authDealer,uploadMultiple, updateCar)
router.get('/allcars',authUser, getAllCars)
router.get('/cardetails/:carId',authUser, fetchCardetails)
router.delete('/deletecar/:carId',authDealer, deleteCar)

export { router as carRouter }