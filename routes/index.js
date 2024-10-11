import express from "express";
const router = express.Router();
import { userRouter } from "./userRoute.js";
import { dealerRouter } from "./dealerRoute.js";
import { carRouter } from "./carRoute.js";
import { adminRouter } from "./adminRoute.js";

router.use('/user', userRouter)
router.use('/dealer', dealerRouter)
router.use('/car', carRouter)

router.use('/admin', adminRouter)

export { router as apiRouter }
