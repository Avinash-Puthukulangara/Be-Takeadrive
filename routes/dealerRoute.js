import express from "express";
const router = express.Router();


router.post('/signup', (req,res,next)=>{})

router.post('/login', (req,res,next)=>{})

router.post('/logout', (req,res,next)=>{})

router.get('/profile', (req,res,next)=>{})

router.put('/editprofile', (req,res,next)=>{})

router.delete('/deleteprofile', (req,res,next)=>{})

export { router as dealerRouter }