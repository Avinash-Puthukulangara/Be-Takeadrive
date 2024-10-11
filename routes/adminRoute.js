import express from 'express';
import { authAdmin } from '../middlewares/authenticateAdmin.js';
import { loginAdmin } from '../controllers/adminController.js';
import { getallDealers } from '../controllers/dealerController.js';
const router = express.Router();


router.post('/loginadmin', authAdmin, loginAdmin);

router.get('/alldealers', authAdmin, getallDealers);




export { router as adminRouter };