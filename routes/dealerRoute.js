import express from "express";
import { deleteDealerprofile, editDealerprofile, fetchDealerprofile, loginDealer, logoutDealer, signupDealer } from "../controllers/dealerController.js";
import { authDealer } from "../middlewares/authenticateDealer.js";
import { upload } from "../middlewares/multer.js";
const router = express.Router();


router.post('/signup', signupDealer)
router.post('/login', loginDealer)
router.get('/profile',authDealer, fetchDealerprofile)
router.put('/editprofile/:dealerId', authDealer, upload.single('dealerpic'), editDealerprofile)
router.post('/logout',authDealer, logoutDealer)
router.delete('/deletedealer/:dealerId',authDealer, deleteDealerprofile)



export { router as dealerRouter }