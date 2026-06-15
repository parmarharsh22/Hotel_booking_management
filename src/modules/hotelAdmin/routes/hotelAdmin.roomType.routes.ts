import { Router } from "express";
import { AdminRoomTypeController } from "../controllers/hotelAdmin.roomType.controller";
import { uploadRoomPhoto } from "../../../common/middlewares/multer";
import { validToken } from "../../../common/middlewares/verifyJWTToken";
import { allowRoles } from "../../../common/middlewares/allowedRoles";
import { upload } from "../../../common/middlewares/multerCloud";

const adminRoomTypeController = new AdminRoomTypeController();

const router = Router();

router.get("/room-types",validToken,allowRoles("ADMIN"),adminRoomTypeController.listRoomTypes.bind(adminRoomTypeController));

// show new room type form  ← must be BEFORE /:typeId routes
router.get("/room-types/new",validToken,allowRoles("ADMIN"),adminRoomTypeController.showNewRoomType.bind(adminRoomTypeController));

// room-type update rendering

router.get("/room-type/edit/:typeId",adminRoomTypeController.showEditRoomType.bind(adminRoomTypeController))

// create room type (with optional photo)
router.post(
  "/room-types",validToken,allowRoles("ADMIN"),
  // uploadRoomPhoto.fields([{ name: "type_photo", maxCount: 1 }]),
      upload.fields([
          { name: "type_photo",  maxCount: 1 },
        
      ]),
  adminRoomTypeController.createRoomType.bind(adminRoomTypeController)
);


// update room type
router.put(
  "/room-types/:typeId",validToken,allowRoles("ADMIN"),
  uploadRoomPhoto.fields([{ name: "type_photo", maxCount: 1 }]),
  adminRoomTypeController.updateRoomType.bind(adminRoomTypeController)
);

// delete room type
router.delete("/room-types/:typeId",validToken,allowRoles("ADMIN"),adminRoomTypeController.deleteRoomType.bind(adminRoomTypeController));

// link amenity to room type
router.post("/room-types/:typeId/amenities",validToken,allowRoles("ADMIN"),adminRoomTypeController.addAmenities.bind(adminRoomTypeController));

// unlink amenity from room type
router.delete("/room-types/:typeId/amenities",validToken,allowRoles("ADMIN"),adminRoomTypeController.removeAmenities.bind(adminRoomTypeController));

export default router;