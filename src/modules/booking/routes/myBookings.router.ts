import { Router } from "express";
import { GuestBookingController } from "../controllers/myBookings.controller";
import { allowRoles } from "../../../common/middlewares/allowedRoles";
import { validToken } from "../../../common/middlewares/verifyJWTToken";

const controller = new GuestBookingController();
const router     = Router();

// All my bookings
router.get("/bookings",
  validToken, allowRoles("GUEST"),
  controller.listMyBookings.bind(controller)
);

// Single booking detail
router.get("/bookings/:bookingId",
  validToken, allowRoles("GUEST"),
  controller.getBookingDetail.bind(controller)
);

export default router;