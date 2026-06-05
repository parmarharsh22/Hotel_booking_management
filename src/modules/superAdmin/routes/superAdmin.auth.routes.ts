import { Router } from "express";
import { SuperAdminController } from "../controllers/superAdmin.auth.controller";

const superAdminController = new SuperAdminController();

const router = Router();

router.get("/superAdmin/login",superAdminController.loginPage.bind(superAdminController));
router.get("/superAdmin/getAllUser",superAdminController.getAllUserData.bind(superAdminController));
router.post("/superAdmin/login",superAdminController.login.bind(superAdminController));

export default router;