import { Router } from "express";
import BookingController from "../controllers/BookingController";
import { validToken } from "../../../common/middlewares/verifyJWTToken";
import { allowRoles } from "../../../common/middlewares/allowedRoles";

const router = Router();

router.get("/:bookingId/edit",validToken,allowRoles("GUEST"), BookingController.showEditBooking);

router.put("/:bookingId", validToken,allowRoles("GUEST"),BookingController.updateBooking);
// router.get(
//     "/check-room",
//     BookingController.
// );
export default router;