import express from "express";
import hotelAdmin from "./routes/hotelAdmin.room.routes";
import hotelAdminRoomTypes from "./routes/hotelAdmin.roomType.routes";
import staff from "./routes/staff.routes";

const router = express.Router();

router.use("/",hotelAdmin);
router.use("/",hotelAdminRoomTypes);
router.use("/",staff);

export default router;