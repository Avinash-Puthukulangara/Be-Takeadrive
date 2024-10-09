import express from "express";
const router = express.Router();
import { userRouter } from "./userRoute.js";
import { dealerRouter } from "./dealerRoute.js";
import { carRouter } from "./carRoute.js";

router.use('/user', userRouter)
router.use('/dealer', dealerRouter)
router.use('/car', carRouter)

export { router as apiRouter }
