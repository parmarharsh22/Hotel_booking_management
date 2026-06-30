
import { Router } from "express";
import { DashboardController } from "../controllers/hotelAdmin.dashboard.controller";
import { validToken } from "../../../../common/middlewares/verifyJWTToken";
import { allowRoles } from "../../../../common/middlewares/allowedRoles";

const hoteladmindashboardController = new DashboardController()
const router  = Router();


router.use(validToken);
router.use(allowRoles("ADMIN"));
router.get('/dashboard',hoteladmindashboardController.renderDashboard);
router.get("/revenue-trend",hoteladmindashboardController.getRevenueTrend.bind(hoteladmindashboardController))

router.get(
  "/booking-status-distribution",
  
  hoteladmindashboardController
    .getBookingStatusDistribution
    .bind(DashboardController)
);
export default router;
