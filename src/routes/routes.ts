import  express  from "express";
const router=express.Router();

import {login, signup} from '../controller/Auth'
import { checkInUser, checkOutUser } from "../controller/UserActivity";
import { auth, isAdmin } from "../middleware/auth";
import { allLeaves, applyLeave, approveLeave, leaveHistory, rejectLeave } from "../controller/Leaves";
import { generateTimesheet, generateTimesheetByDate } from "../controller/UserTimeSheet";

router.post('/signup',signup);
router.post('/login',login);

router.post('/checkIn',auth,checkInUser);
router.post('/checkOut',auth,checkOutUser);

router.post('/applyLeave',auth,applyLeave)
router.get('/leaveHistory',auth,leaveHistory)

router.put('/approve-leave/:leaveId',auth,isAdmin,approveLeave)
router.put('/reject-leave/:leaveId',auth,isAdmin,rejectLeave)

router.get('/AllLeave',auth,isAdmin,allLeaves)

router.get('/user-timesheet',auth,generateTimesheet)
router.post('/user-timesheet',auth,generateTimesheetByDate)





export default router;