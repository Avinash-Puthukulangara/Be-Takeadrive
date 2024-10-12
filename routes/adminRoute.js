import express from 'express';
import { authAdmin } from '../middlewares/authenticateAdmin.js';
import { carApproval, carPending, carRejection, loginAdmin, logoutAdmin } from '../controllers/adminController.js';
import { getallDealers } from '../controllers/dealerController.js';
import { getallUsers } from '../controllers/userController.js';
const router = express.Router();

//admin based//
router.post('/loginadmin', loginAdmin);
router.post('/logoutadmin', authAdmin, logoutAdmin);


//dealer based//
router.get('/alldealers', authAdmin, getallDealers);


//user based//
router.get('/allusers', authAdmin, getallUsers);


//car based//
router.get('/pendingcars', authAdmin, carPending);
router.put('/approvecars/:carId', authAdmin, carApproval);
router.put('/rejectcars/:carId', authAdmin, carRejection);


export { router as adminRouter };