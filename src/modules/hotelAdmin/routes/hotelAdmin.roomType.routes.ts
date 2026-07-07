import { Router } from "express";
import { AdminRoomTypeController } from "../controllers/hotelAdmin.roomType.controller";
import { uploadRoomPhoto } from "../../../common/middlewares/multer";
import { validToken } from "../../../common/middlewares/verifyJWTToken";
import { allowRoles } from "../../../common/middlewares/allowedRoles";
import { upload } from "../../../common/middlewares/multerCloud";

const adminRoomTypeController = new AdminRoomTypeController();

const router = Router();

router.get("/room-types", validToken, allowRoles("ADMIN"), adminRoomTypeController.listRoomTypes.bind(adminRoomTypeController));

router.get("/room-types/new", validToken, allowRoles("ADMIN"), adminRoomTypeController.showNewRoomType.bind(adminRoomTypeController));


router.get("/room-type/edit/:typeId", validToken, allowRoles("ADMIN"), adminRoomTypeController.showEditRoomType.bind(adminRoomTypeController))

router.post(
  "/room-types", validToken, allowRoles("ADMIN"),
  // uploadRoomPhoto.fields([{ name: "type_photo", maxCount: 1 }]),
  upload.fields([
    { name: "type_photo", maxCount: 1 },

  ]),
  adminRoomTypeController.createRoomType.bind(adminRoomTypeController)
);


router.put(
  "/room-types/:typeId", validToken, allowRoles("ADMIN"),
  upload.fields([{ name: "type_photo", maxCount: 1 }]),
  adminRoomTypeController.updateRoomType.bind(adminRoomTypeController)
);

router.delete("/room-types/:typeId", validToken, allowRoles("ADMIN"), adminRoomTypeController.deleteRoomType.bind(adminRoomTypeController));

router.post("/room-types/:typeId/amenities", validToken, allowRoles("ADMIN"), adminRoomTypeController.addAmenities.bind(adminRoomTypeController));

router.delete("/room-types/:typeId/amenities", validToken, allowRoles("ADMIN"), adminRoomTypeController.removeAmenities.bind(adminRoomTypeController));

export default router;