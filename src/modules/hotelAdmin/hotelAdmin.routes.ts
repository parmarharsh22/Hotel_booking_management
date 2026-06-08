import express from "express";
import hotelAdmin from "./routes/hotelAdmin.room.routes";

const router = express.Router();

router.use("/",hotelAdmin);

export default router;