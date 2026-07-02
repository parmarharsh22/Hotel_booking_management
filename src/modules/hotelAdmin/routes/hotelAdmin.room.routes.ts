import { Router } from "express";
import { AdminRoomController } from "../controllers/hotelAdmin.room.controller";
import { uploadRoomPhoto } from "../../../common/middlewares/multer";
import { validToken } from "../../../common/middlewares/verifyJWTToken";
import { allowRoles } from "../../../common/middlewares/allowedRoles";
import fetchHotel from "../controllers/fetchHotelName.controller";

const adminController = new AdminRoomController();

const router = Router();

// List all rooms
router.get("/rooms",validToken,allowRoles("ADMIN"),adminController.listRooms.bind(adminController));


router.get("/rooms/new",validToken,allowRoles("ADMIN"),adminController.showNewRoom.bind(adminController));

router.post(
  "/rooms",validToken,allowRoles("ADMIN"),
  uploadRoomPhoto.fields([{ name: "room_photo", maxCount: 1 }]),
  adminController.createRoom.bind(adminController)
);


// Show edit form for a specific room
router.get("/rooms/:roomId/edit",validToken,allowRoles("ADMIN"),adminController.showEditRoom.bind(adminController));


// Update room details (method-override turns form POST → PUT)
router.put(
  "/rooms/:roomId",validToken,allowRoles("ADMIN"),
  uploadRoomPhoto.fields([{ name: "room_photo", maxCount: 1 }]),
  adminController.updateRoom.bind(adminController)
);


// Delete a room (method-override turns form POST → DELETE)
router.delete("/rooms/:roomId",validToken,allowRoles("ADMIN"),adminController.deleteRoom.bind(adminController));

// Change room status only (separate from full update)
router.put("/rooms/:roomId/status",validToken,allowRoles("ADMIN"),adminController.updateRoomStatus.bind(adminController));


router.get("/rooms/verifyRoomExists" , validToken,allowRoles("ADMIN"),adminController.isRoomExists.bind(adminController))
//fetch Version
router.get(
    "/room-list-types",
    validToken,
    allowRoles("ADMIN"),
    adminController.getRoomTypes.bind(adminController)
);


router.get("/hotel", validToken,allowRoles("ADMIN"),fetchHotel)



router.get(
    "/room-statuses",
    validToken,
    allowRoles("ADMIN"),
    adminController.getRoomStatuses.bind(adminController)
);

export default router;   