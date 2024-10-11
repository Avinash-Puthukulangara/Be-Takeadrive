import express from "express";
import { deleteUser, editUser, fetchUser, loginUser, logoutUser, signupUser } from "../controllers/userController.js";
import { authUser } from "../middlewares/authenticateUser.js";
import { upload }from "../middlewares/multer.js";
const router = express.Router();


router.post('/signup', signupUser)
router.post('/login', loginUser)
router.get('/profile',authUser, fetchUser)
router.put('/edituser/:userId',authUser,upload.single('userpic') ,editUser)
router.delete('/deleteuser/:userId', authUser, deleteUser)
router.post('/logout',authUser, logoutUser)



export { router as userRouter }