import express from "express";
import { deleteUser, editUser, fetchUser, loginUser, logoutUser, signupUser } from "../controllers/userController.js";
import { authUser } from "../middlewares/authenticateUser.js";
import { uploadMultiple } from "../middlewares/multer.js";
import { carBooking } from "../controllers/bookingController.js";
const router = express.Router();


router.post('/signup',uploadMultiple, signupUser)
router.post('/login', loginUser)
router.get('/profile',authUser, fetchUser)
router.put('/edituser/:userId',authUser, uploadMultiple, editUser)
router.delete('/deleteuser/:userId', authUser, deleteUser)
router.post('/logout',authUser, logoutUser)

router.post('/bookcar', authUser, carBooking)



export { router as userRouter }