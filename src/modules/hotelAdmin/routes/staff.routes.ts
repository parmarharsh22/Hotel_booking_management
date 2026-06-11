import { Router } from "express";
import { AdminStaffController } from "../controllers/staff.controller";
import { uploadProfilePhoto } from "../../../common/middlewares/multer";
import { validToken } from "../../../common/middlewares/verifyJWTToken";

const staffController = new AdminStaffController();

const router = Router();

router.get("/ ",validToken,staffController.listStaff.bind(staffController));
router.get("/staff/new",staffController.showNewStaff.bind(staffController));  // before /:userId
router.post("/staff",
  uploadProfilePhoto.fields([{ name: "staff_photo", maxCount: 1 }]),
  staffController.createStaff.bind(staffController)
);

router.get("/staff/:userId/edit",staffController.showEditStaff.bind(staffController));

router.put("/staff/:userId",
  uploadProfilePhoto.fields([{ name: "staff_photo", maxCount: 1 }]),
  staffController.updateStaff.bind(staffController)
);
router.delete("/staff/:userId",staffController.deleteStaff.bind(staffController));

export default router;