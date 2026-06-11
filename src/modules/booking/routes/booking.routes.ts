import { Router } from "express";
import * as bookingController from "../controllers/booking.controller";
import { validToken } from "../../../common/middlewares/verifyJWTToken";

const router = Router();

// Page
router.get("/payment-page", bookingController.paymentPage);

// API
router.post("/hold",   validToken,          bookingController.holdBooking);
router.get("/hold/:hold_id",     bookingController.getHold);
router.post("/confirm",          bookingController.confirmBooking);
router.post("/payment-success",  bookingController.paymentSuccess);
router.post("/payment-failed",   bookingController.paymentFailed);

export default router;

