
import { Router } from "express";
import BookingCancellationController from "../controllers/BookingCancellationController";
import { validToken } from "../../../common/middlewares/verifyJWTToken";
import { allowRoles } from "../../../common/middlewares/allowedRoles";
// import { authenticateUser } from "../../../middlewares/authenticateUser";

const router = Router();

/**
 * ======================================================
 * Booking Cancellation Routes
 * Base URL:
 * /mybookings
 * ======================================================
 */

/**
 * ------------------------------------------------------
 * GET
 * Cancellation Preview Page
 *
 * GET /mybookings/:bookingId/cancel
 * ------------------------------------------------------
 */
router.get(
    "/:bookingId/cancel",
    validToken,allowRoles("GUEST"),
    BookingCancellationController.showCancellationPage
);

/**
 * ------------------------------------------------------
 * POST
 * Cancel Booking
 *
 * POST /mybookings/:bookingId/cancel
 * ------------------------------------------------------
 */
router.post(
    "/:bookingId/cancel",
    validToken,allowRoles("GUEST"),
    BookingCancellationController.cancelBooking
);

export default router;

