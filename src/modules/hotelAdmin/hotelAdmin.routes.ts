import express from "express";
import hotelAdmin from "./routes/hotelAdmin.room.routes";
import hotelAdminRoomTypes from "./routes/hotelAdmin.roomType.routes";
import staff from "./routes/staff.routes";
import policy from "./routes/hotelAdmin.policy.routes";
import hotelDashBoard from './dashboard/routes/hoteladmin.dashboard.routes'
const router = express.Router();

router.use("/",hotelAdmin);
router.use("/",hotelAdminRoomTypes);
router.use("/",staff);
router.use("/",policy);
router.use("/",hotelDashBoard)
export default router;