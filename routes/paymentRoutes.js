import express from "express";
import { authUser } from "../middlewares/authenticateUser.js";
import { createPayment, getPaymentStatus, paymentSuccess } from "../controllers/paymentController.js";
const router = express.Router();

router.post('/makepayment', authUser, createPayment);
router.get('/sessionstatus', authUser, getPaymentStatus)
router.get('/paymentsuccess', authUser, paymentSuccess)


export { router as paymentRouter }