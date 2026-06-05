import { Router } from "express";
import { SuperAdminController } from "../controllers/superAdmin.auth.controller";

const superAdminController = new SuperAdminController();

const router = Router();

router.get("/login",superAdminController.loginPage.bind(superAdminController));
router.get("/getAllUser",superAdminController.getAllUserData.bind(superAdminController));
router.post("/login",superAdminController.login.bind(superAdminController));

export default router;