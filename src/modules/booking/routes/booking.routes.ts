import { Router } from "express";
import * as bookingController from "../controllers/booking.controller";
import { validToken } from "../../../common/middlewares/verifyJWTToken";
import { allowRoles } from "../../../common/middlewares/allowedRoles";
import { GuestBookingController } from "../controllers/myBookings.controller";


const router = Router();
const controller = new GuestBookingController();


// Page routes
router.get("/payment-page", bookingController.paymentPage);

// API routes
router.post("/hold",            validToken, bookingController.holdBooking);   // needs login
router.get("/hold/:hold_id",               bookingController.getHold);
router.post("/confirm",                    bookingController.confirmBooking);
router.post("/payment-success",            bookingController.paymentSuccess);
router.post("/payment-failed",             bookingController.paymentFailed);

// All my bookings
router.get("/all",
  validToken, allowRoles("GUEST"),
  controller.listMyBookings.bind(controller)
);

// Single booking detail
router.get("/:bookingId",
  validToken, allowRoles("GUEST"),
  controller.getBookingDetail.bind(controller)
);

export default router;