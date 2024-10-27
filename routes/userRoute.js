import express from "express";
import { checkUser, deleteUser, editUser, fetchUser, loginUser, logoutUser, signupUser } from "../controllers/userController.js";
import { authUser } from "../middlewares/authenticateUser.js";
import { uploadMultiple } from "../middlewares/multer.js";
const router = express.Router();


router.post('/signup',uploadMultiple, signupUser)
router.post('/login', loginUser)
router.get('/profile',authUser, fetchUser)
router.put('/edituser/:userId',authUser, uploadMultiple, editUser)
router.delete('/deleteuser/:userId', authUser, deleteUser)
router.post('/logout',authUser, logoutUser)
router.get('/checkuser',authUser, checkUser)





export { router as userRouter }