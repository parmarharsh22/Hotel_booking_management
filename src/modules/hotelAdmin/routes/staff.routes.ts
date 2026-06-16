import { Router } from "express";
import { AdminStaffController } from "../controllers/staff.controller";
import { uploadProfilePhoto } from "../../../common/middlewares/multer";
import { validToken } from "../../../common/middlewares/verifyJWTToken";
import { allowRoles } from "../../../common/middlewares/allowedRoles";

const staffController = new AdminStaffController();

const router = Router();

router.get("/ ",validToken,allowRoles("ADMIN"),staffController.listStaff.bind(staffController));
router.get("/staff/new",validToken,allowRoles("ADMIN"),staffController.showNewStaff.bind(staffController));  // before /:userId
router.post("/staff",validToken,allowRoles("ADMIN"),
  uploadProfilePhoto.fields([{ name: "staff_photo", maxCount: 1 }]),
  staffController.createStaff.bind(staffController)
);

router.get("/staff/:userId/edit",validToken,allowRoles("ADMIN"),staffController.showEditStaff.bind(staffController));

router.put("/staff/:userId",validToken,allowRoles("ADMIN"),
  uploadProfilePhoto.fields([{ name: "staff_photo", maxCount: 1 }]),
  staffController.updateStaff.bind(staffController)
);
router.delete("/staff/:userId",validToken,allowRoles("ADMIN"),staffController.deleteStaff.bind(staffController));

export default router;