import { Request, Response } from "express";
import * as bookingService from "../services/booking.service";
import * as bookingModel from "../models/booking.model";
import { db } from "../../../config/db";

// ─── GET /bookings/payment-page ───────────────────────────────────────────────
// Renders the payment page. Fetches hold data from Redis so the
// page loads fully populated — no client-side fetch needed.
export const paymentPage = async (req: Request, res: Response) => {
    const hold_id = req.query.hold_id as string;

    // No hold_id in URL → send back to home
    if (!hold_id) return res.redirect("/");

    try {
        // Fetch hold from Redis and pass it directly to the EJS template
        const holdData = await bookingService.getHold(hold_id);
        res.render("booking/payment", { hold_id, holdData });
    } catch {
        // Hold expired or invalid → send back to search
        return res.redirect("/");
    }
};

// ─── POST /bookings/hold ──────────────────────────────────────────────────────
// Creates a 10-minute Redis hold on the selected rooms.
// Requires the user to be logged in (validToken middleware).
export const holdBooking = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        if (!user) {
            return res.status(401).json({ success: false, error: "Login required" });
        }

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

// ─── GET /bookings/hold/:hold_id ──────────────────────────────────────────────
// Returns hold data (used by payment page if it needs to re-fetch).
export const getHold = async (req: Request, res: Response) => {
    try {
        const data = await bookingService.getHold(req.params.hold_id as string);
        res.json(data);
    } catch (err: any) {
        res.status(404).json({ success: false, error: err.message });
    }
};

// ─── POST /bookings/confirm ───────────────────────────────────────────────────
// Writes the booking to the database and clears the Redis hold.
// Called when user clicks Pay on the payment page.
export const confirmBooking = async (req: Request, res: Response) => {
    try {
        const { hold_id, payment_method_id } = req.body;

        if (!hold_id) {
            return res.status(400).json({ success: false, error: "hold_id is required" });
        }

        const result = await bookingService.confirmBooking(
            hold_id,
            Number(payment_method_id) || 2 // default to CARD
        );

        res.json(result);

    } catch (err: any) {
        console.error("CONFIRM ERROR:", err.message);
        res.status(400).json({ success: false, error: err.message });
    }
};

// ─── POST /bookings/payment-success ──────────────────────────────────────────
// Marks payment as SUCCESS.
// Dev: called directly from frontend. Prod: called from payment gateway webhook.
export const paymentSuccess = async (req: Request, res: Response) => {
    try {
        const { booking_id } = req.body;
        if (!booking_id) {
            return res.status(400).json({ success: false, error: "booking_id required" });
        }

        await bookingService.markPaymentSuccess(Number(booking_id));
        res.json({ success: true });

    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// ─── POST /bookings/payment-failed ───────────────────────────────────────────
// Marks payment as FAILED.
export const paymentFailed = async (req: Request, res: Response) => {
    try {
        const { booking_id } = req.body;
        if (!booking_id) {
            return res.status(400).json({ success: false, error: "booking_id required" });
        }

        await bookingService.markPaymentFailed(Number(booking_id));
        res.json({ success: true });

    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// ─── POST /bookings/simple ─────────────────────────────────────────────────
// Creates a booking directly — no Redis hold, no separate payment step.
// Finds available rooms, books them, records payment as SUCCESS immediately.
export const createSimpleBooking = async (req: Request, res: Response) => {
    const connection = await db.getConnection();
    try {
        const user = (req as any).user;
        if (!user) {
            return res.status(401).json({ success: false, error: "Login required" });
        }

        const { hotel_id,room_type_id,checkin_date, checkout_date, adults, children, qty,
            payment_method_id, special_requests, } = req.body;

        if (!hotel_id || !room_type_id || !checkin_date || !checkout_date || !qty) {
            return res.status(400).json({ success: false, error: "Missing required fields" });
        }

        const availableRooms = await bookingModel.getAvailableRooms(
            Number(hotel_id),
            Number(room_type_id),
            checkin_date,
            checkout_date,
            Number(qty)
        );

        if (availableRooms.length < Number(qty)) {
            return res.status(400).json({ success: false, error: "Not enough rooms available for these dates" });
        }

        const totalAmount = availableRooms.reduce(
            (sum: number, r: any) => sum + Number(r.rate_per_night),
            0
        );
        const bookingReference = `HBMS-${Date.now().toString(36).toUpperCase()}`;

        await connection.beginTransaction();

        const bookingId = await bookingModel.createBooking(connection, {
            hotel_id: Number(hotel_id),
            user_id: user.userId,
            booking_status_id: 2, // adjust to your CONFIRMED status id
            booking_source_id: 1, // adjust to your "website" source id
            booking_reference: bookingReference,
            checkin_date,
            checkout_date,
            adults: Number(adults) || 1,
            children: Number(children) || 0,
            total_amount: totalAmount,
            special_requests,
        });

        await bookingModel.createBookingRooms(
            connection,
            bookingId,
            availableRooms.map((r: any) => ({
                room_id: r.room_id,
                rate_per_night: r.rate_per_night,
            }))
        );

        await bookingModel.createPayment(connection, {
            hotel_id: Number(hotel_id),
            booking_id: bookingId,
            amount: totalAmount,
            payment_method_id: Number(payment_method_id) || 2,
        });

        await connection.commit();

        // mark payment SUCCESS immediately — no real gateway in this simple flow
        await bookingModel.updatePaymentStatus(bookingId, 2);

        return res.status(200).json({
            success: true,
            booking_id: bookingId,
            booking_reference: bookingReference,
            total_amount: totalAmount,
        });
    } catch (err: any) {
        await connection.rollback();
        console.error("SIMPLE BOOKING ERROR:", err.message);
        return res.status(400).json({ success: false, error: err.message });
    } finally {
        connection.release();
    }
};
