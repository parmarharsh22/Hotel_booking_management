
import { Router } from "express";
import { DashboardController } from "../controllers/hotelAdmin.dashboard.controller";

const hoteladmindashboardController = new DashboardController()
const router  = Router();

router.get('/dashboard',hoteladmindashboardController.renderDashboard);
router.get("/revenue-trend",hoteladmindashboardController.getRevenueTrend.bind(hoteladmindashboardController))

router.get(
  "/booking-status-distribution",
  
  hoteladmindashboardController
    .getBookingStatusDistribution
    .bind(DashboardController)
);
export default router;
