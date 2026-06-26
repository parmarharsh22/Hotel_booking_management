import { Router } from "express";
import * as bookingController from "../controllers/booking.controller";
import { validToken } from "../../../common/middlewares/verifyJWTToken";
import { allowRoles } from "../../../common/middlewares/allowedRoles";
import { GuestBookingController } from "../controllers/myBookings.controller";

const router = Router();
const controller = new GuestBookingController();

// Page routes
router.get(
  "/payment-page",
  validToken,
  allowRoles("GUEST"),
  bookingController.paymentPage,
);

// API routes
router.post(
  "/hold",
  validToken,
  allowRoles("GUEST"),
  bookingController.holdBooking,
); // needs login
router.get(
  "/hold/:hold_id",
  validToken,
  allowRoles("GUEST"),
  bookingController.getHold,
);
router.post(
  "/confirm",
  validToken,
  allowRoles("GUEST"),
  bookingController.confirmBooking,
);
router.post(
  "/payment-success",
  
  validToken,
  allowRoles("GUEST"),
  bookingController.paymentSuccess,
);
router.post(
  "/payment-failed",
  validToken,
  allowRoles("GUEST"),
  bookingController.paymentFailed,
);

// All my bookings
router.get(
  "/all",
  validToken,
  allowRoles("GUEST"),
  controller.listMyBookings.bind(controller),
);

// Single booking detail
router.get(
  "/:bookingId",
  validToken,
  allowRoles("GUEST"),
  controller.getBookingDetail.bind(controller),
);

router.get(
  "/notifications/data",
  validToken,
  allowRoles("GUEST"),
  controller.getNotifications.bind(controller),
)

export default router;
