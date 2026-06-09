import { Router } from "express";
import { AdminRoomTypeController } from "../controllers/hotelAdmin.roomType.controller";
import { uploadRoomPhoto } from "../../../common/middlewares/multer";

const adminRoomTypeController = new AdminRoomTypeController();

const router = Router();

router.get("/room-types", adminRoomTypeController.listRoomTypes.bind(adminRoomTypeController));

// show new room type form  ← must be BEFORE /:typeId routes
router.get("/room-types/new", adminRoomTypeController.showNewRoomType.bind(adminRoomTypeController));

// create room type (with optional photo)
router.post(
  "/room-types",
  uploadRoomPhoto.fields([{ name: "type_photo", maxCount: 1 }]),
  adminRoomTypeController.createRoomType.bind(adminRoomTypeController)
);

// update room type
router.put(
  "/room-types/:typeId",
  uploadRoomPhoto.fields([{ name: "type_photo", maxCount: 1 }]),
  adminRoomTypeController.updateRoomType.bind(adminRoomTypeController)
);

// delete room type
router.delete("/room-types/:typeId", adminRoomTypeController.deleteRoomType.bind(adminRoomTypeController));

// link amenity to room type
router.post("/room-types/:typeId/amenities", adminRoomTypeController.addAmenities.bind(adminRoomTypeController));

// unlink amenity from room type
router.delete("/room-types/:typeId/amenities", adminRoomTypeController.removeAmenities.bind(adminRoomTypeController));

export default router;