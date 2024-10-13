import express from "express";
import { deleteDealer, editDealer, fetchDealer, loginDealer, logoutDealer, signupDealer } from "../controllers/dealerController.js";
import { authDealer } from "../middlewares/authenticateDealer.js";
import { uploadMultiple } from "../middlewares/multer.js";
const router = express.Router();


router.post('/signup', signupDealer)
router.post('/login', loginDealer)
router.get('/profile',authDealer, fetchDealer)
router.put('/editdealer/:dealerId', authDealer,uploadMultiple, editDealer)
router.post('/logout',authDealer, logoutDealer)
router.delete('/deletedealer/:dealerId',authDealer, deleteDealer)






export { router as dealerRouter }