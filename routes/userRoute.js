import express from "express";
import { deleteUserprofile, editUserprofile, fetchUserprofile, loginUser, logoutUser, signupUser } from "../controllers/userController.js";
import { authUser } from "../middlewares/authenticateUser.js";
import { upload }from "../middlewares/multer.js";
const router = express.Router();


router.post('/signup', signupUser)
router.post('/login', loginUser)
router.get('/profile',authUser, fetchUserprofile)
router.put('/editprofile/:userId',authUser,upload.single('userpic') ,editUserprofile)
router.delete('/deleteprofile/:userId', authUser, deleteUserprofile)
router.post('/logout',authUser, logoutUser)



export { router as userRouter }