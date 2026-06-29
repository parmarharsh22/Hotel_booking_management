import { Router } from "express";
import { SuperAdminController } from "../controllers/superAdmin.auth.controller";
import { validToken } from "../../../common/middlewares/verifyJWTToken";
import { allowRoles } from "../../../common/middlewares/allowedRoles";

const superAdminController = new SuperAdminController();

const router = Router();
router.get("/login",superAdminController.loginPage.bind(superAdminController));
router.post("/login",superAdminController.login.bind(superAdminController));

router.use(validToken);
router.use(allowRoles("SUPER_ADMIN"))
router.get("/getAllUser",superAdminController.getAllUserData.bind(superAdminController));
router.get(
  "/me", superAdminController.fetchUserDetails.bind(superAdminController)
);

export default router;