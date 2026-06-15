import { Router } from "express";
import * as dashboardController from "../controllers/dashboard.controller";
import { validToken } from "../../../common/middlewares/verifyJWTToken";
import { allowRoles } from "../../../common/middlewares/allowedRoles";

const router = Router();

router.use(validToken);
router.use(allowRoles("SUPER_ADMIN"));
router.get("/",      dashboardController.dashboardPage);
router.get("/stats", dashboardController.getDashboardStats);

export default router;
