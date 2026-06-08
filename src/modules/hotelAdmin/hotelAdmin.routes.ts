import express from "express";
import hotelAdmin from "./routes/hotelAdmin.room.routes";
import hotelAdminRoomTypes from "./routes/hotelAdmin.roomType.routes";

const router = express.Router();

router.use("/",hotelAdmin);
router.use("/",hotelAdminRoomTypes);

export default router;