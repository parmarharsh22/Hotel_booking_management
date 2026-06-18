import express from "express";
import invoice from "./routes/invoice.routes";

const router = express.Router();

router.use("/",invoice);

export default router;