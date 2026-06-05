import express from "express";
import tenantRoutes from "./routes/tenant.routes";

const router = express.Router();

/**
 * BASE: /superadmin/hotels
 */
router.use("/hotels", tenantRoutes);


export default router;