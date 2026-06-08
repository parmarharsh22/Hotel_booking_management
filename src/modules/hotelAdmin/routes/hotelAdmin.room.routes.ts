import { Router } from "express";
import { AdminController } from "../controllers/hotelAdmin.room.controller";
import { uploadRoomPhoto } from "../../../common/middlewares/multer";

const adminController = new AdminController();

const router = Router();

// List all rooms
router.get("/rooms", adminController.listRooms.bind(adminController));


router.get("/rooms/new", adminController.showNewRoom.bind(adminController));

router.post(
  "/rooms",
  uploadRoomPhoto.fields([{ name: "room_photo", maxCount: 1 }]),
  adminController.createRoom.bind(adminController)
);


// Show edit form for a specific room
router.get("/rooms/:roomId/edit", adminController.showEditRoom.bind(adminController));


// Update room details (method-override turns form POST → PUT)
router.put(
  "/rooms/:roomId",
  uploadRoomPhoto.fields([{ name: "room_photo", maxCount: 1 }]),
  adminController.updateRoom.bind(adminController)
);


// Delete a room (method-override turns form POST → DELETE)
router.delete("/rooms/:roomId", adminController.deleteRoom.bind(adminController));

// Change room status only (separate from full update)
router.put("/rooms/:roomId/status", adminController.updateRoomStatus.bind(adminController));

export default router;