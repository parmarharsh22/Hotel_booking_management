import express from "express";
import tenantRoutes from "./routes/tenant.routes";
import superAdminAuthRoutes from "./routes/superAdmin.auth.routes";
import dashboardRoutes from "./routes/dashboard.routes";


const router = express.Router();

/**
 * BASE: /superadmin/hotels
 */
router.use("/hotels", tenantRoutes);
router.use("/auth",superAdminAuthRoutes)
router.use("/dashboard", dashboardRoutes)


export default router;