import express from "express";
const router = express.Router();
import { userRouter } from "./userRoute.js";
import { dealerRouter } from "./dealerRoute.js";

router.use('/user', userRouter)
router.use('/dealer', dealerRouter)

export { router as apiRouter }
