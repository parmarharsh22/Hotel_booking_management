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
);

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

// Edit booking page
router.get(
  "/:bookingId/edit",
  (req, res) => {
    const booking = {
      checkin_date: new Date(),
      checkout_date: new Date(),
    };

    const rooms: any[] = [];

    res.render("myBookings/edit", {
      booking,
      rooms,
    });
  }
);

router.post(
  "/simple",
  validToken,
  allowRoles("GUEST"),
  bookingController.createSimpleBooking,
);

// Notifications
router.get(
  "/notifications/data",
  validToken,
  allowRoles("GUEST"),
  controller.getNotifications.bind(controller),
);

export default router;
