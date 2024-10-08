import express from "express";
import { fetchUserprofile, loginUser, signupUser } from "../controllers/userController.js";
const router = express.Router();


router.post('/signup', signupUser)
router.post('/login', loginUser)
router.get('/profile', fetchUserprofile)
router.put('/editprofile', (req,res,next)=>{})
router.post('/logout', (req,res,next)=>{})
router.delete('/deleteprofile', (req,res,next)=>{})


export { router as userRouter }