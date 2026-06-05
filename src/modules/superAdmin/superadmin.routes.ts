import express from "express";
import tenantRoutes from "./routes/tenant.routes";
import superAdminAuthRoutes from "./routes/tenant.routes";


const router = express.Router();

/**
 * BASE: /superadmin/hotels
 */
router.use("/hotels", tenantRoutes);
router.use("/auth",superAdminAuthRoutes)


export default router;