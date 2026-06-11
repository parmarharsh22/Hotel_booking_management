import { Request, Response } from "express";
import * as bookingService from "../services/booking.service";

/**
 * GET /bookings/payment-page
 * Renders the payment EJS page
 */
export const paymentPage = (req: Request, res: Response) => {
    const hold_id = req.query.hold_id as string;
    if (!hold_id) return res.redirect("/");
    res.render("booking/payment", { hold_id });
};

/**
 * POST /bookings/hold
 * Creates a 10-min Redis hold and locks rooms
 */
export const holdBooking = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        if (!user) return res.status(401).json({ success: false, error: "Login required" });

        const { hotel_id, checkin_date, checkout_date, adults, children, rooms, special_requests } = req.body;

        if (!hotel_id || !checkin_date || !checkout_date || !rooms?.length) {
            return res.status(400).json({ success: false, error: "Missing required fields" });
        }

        const result = await bookingService.holdBooking({
            hotel_id:      Number(hotel_id),
            user_id:       user.userId,
            checkin_date,
            checkout_date,
            adults:        Number(adults)   || 1,
            children:      Number(children) || 0,
            rooms,
            special_requests,
        });

        res.json(result);

    } catch (err: any) {
        console.error("HOLD ERROR:", err.message);
        res.status(400).json({ success: false, error: err.message });
    }
};

/**
 * GET /bookings/hold/:hold_id
 * Returns hold data for payment page to populate summary
 */
export const getHold = async (req: Request, res: Response) => {
    try {
        const data = await bookingService.getHold(req.params.hold_id as string);
        res.json(data);
    } catch (err: any) {
        res.status(404).json({ success: false, error: err.message });
    }
};

/**
 * POST /bookings/confirm
 * Confirms booking + creates payment record as PENDING
 */
export const confirmBooking = async (req: Request, res: Response) => {
    try {
        const { hold_id, payment_method_id } = req.body;

        if (!hold_id) {
            return res.status(400).json({ success: false, error: "hold_id is required" });
        }

        const result = await bookingService.confirmBooking(
            hold_id,
            Number(payment_method_id) || 2  // default CARD
        );

        res.json(result);

    } catch (err: any) {
        console.error("CONFIRM ERROR:", err.message);
        res.status(400).json({ success: false, error: err.message });
    }
};

/**
 * POST /bookings/payment-success
 * Marks payment as SUCCESS (dummy — real flow uses webhook)
 */
export const paymentSuccess = async (req: Request, res: Response) => {
    try {
        const { booking_id } = req.body;
        if (!booking_id) return res.status(400).json({ success: false, error: "booking_id required" });

        await bookingService.markPaymentSuccess(Number(booking_id));
        res.json({ success: true });

    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
};

/**
 * POST /bookings/payment-failed
 * Marks payment as FAILED
 */
export const paymentFailed = async (req: Request, res: Response) => {
    try {
        const { booking_id } = req.body;
        if (!booking_id) return res.status(400).json({ success: false, error: "booking_id required" });

        await bookingService.markPaymentFailed(Number(booking_id));
        res.json({ success: true });

    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
};

