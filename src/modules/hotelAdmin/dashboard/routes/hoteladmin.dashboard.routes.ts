
import { Router } from "express";
import { DashboardController } from "../controllers/hotelAdmin.dashboard.controller";
import { allowRoles } from "../../../../common/middlewares/allowedRoles";
import { validToken } from "../../../../common/middlewares/verifyJWTToken";

const hoteladmindashboardController = new DashboardController()
const router  = Router();

router.get('/dashboard',validToken,allowRoles("ADMIN"),hoteladmindashboardController.renderDashboard);
router.get("/revenue-trend", validToken,allowRoles("ADMIN"), hoteladmindashboardController.getRevenueTrend.bind(hoteladmindashboardController))

router.get(
  "/booking-status-distribution",
  validToken,allowRoles("ADMIN"),
  hoteladmindashboardController
    .getBookingStatusDistribution
    .bind(DashboardController)
);
export default router;
