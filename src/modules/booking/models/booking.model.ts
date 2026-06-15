import { db } from "../../../config/db";

// ─── Get rooms that are free for the given dates ──────────────────────────────
// Checks: room is physically available (status=1) AND not already booked
export const getAvailableRooms = async (
    hotel_id: number,
    room_type_id: number,
    checkin_date: string,
    checkout_date: string,
    qty: number
) => {
    const [rooms]: any = await db.query(
        `SELECT
            r.room_id,
            r.room_number,
            rt.type_name,
            rt.base_price AS rate_per_night
         FROM rooms r
         JOIN room_types rt ON r.room_type_id = rt.room_type_id
         WHERE r.hotel_id       = ?
           AND r.room_type_id   = ?
           AND r.room_status_id = 1
           AND r.room_id NOT IN (
               SELECT br.room_id
               FROM booking_rooms br
               JOIN bookings b ON br.booking_id = b.booking_id
               WHERE b.hotel_id          = ?
                 AND b.booking_status_id != 5
                 AND b.checkin_date       < ?
                 AND b.checkout_date      > ?
           )
         LIMIT ?`,
        [hotel_id, room_type_id, hotel_id, checkout_date, checkin_date, qty]
    );
    return rooms;
};

// ─── Save a new booking row ───────────────────────────────────────────────────
export const createBooking = async (
    connection: any,
    data: {
        hotel_id: number;
        user_id: number;
        booking_status_id: number;
        booking_source_id: number;
        booking_reference: string;
        checkin_date: string;
        checkout_date: string;
        adults: number;
        children: number;
        total_amount: number;
        special_requests?: string;
    }
) => {
    const [result]: any = await connection.query(
        `INSERT INTO bookings
         (hotel_id, user_id, booking_status_id, booking_source_id,
          booking_reference, checkin_date, checkout_date,
          adults, children, total_amount, special_requests)
         VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
        [
            data.hotel_id,
            data.user_id,
            data.booking_status_id,
            data.booking_source_id,
            data.booking_reference,
            data.checkin_date,
            data.checkout_date,
            data.adults,
            data.children,
            data.total_amount,
            data.special_requests || null,
        ]
    );
    return result.insertId; // the new booking_id
};

// ─── Link rooms to a booking (one row per room) ───────────────────────────────
export const createBookingRooms = async (
    connection: any,
    bookingId: number,
    rooms: { room_id: number; rate_per_night: number }[]
) => {
    for (const room of rooms) {
        await connection.query(
            `INSERT INTO booking_rooms (booking_id, room_id, rate_per_night)
             VALUES (?, ?, ?)`,
            [bookingId, room.room_id, room.rate_per_night]
        );
    }
};

// ─── Save payment record as PENDING ──────────────────────────────────────────
export const createPayment = async (
    connection: any,
    data: {
        hotel_id: number;
        booking_id: number;
        amount: number;
        payment_method_id: number;
    }
) => {
    await connection.query(
        `INSERT INTO payments
         (hotel_id, booking_id, payment_method_id, payment_status_id, amount)
         VALUES (?, ?, ?, 1, ?)`,
        [data.hotel_id, data.booking_id, data.payment_method_id, data.amount]
    );
};

// ─── Update payment status (2=SUCCESS, 3=FAILED, 4=REFUNDED) ─────────────────
export const updatePaymentStatus = async (
    booking_id: number,
    payment_status_id: number
) => {
    await db.query(
        `UPDATE payments
         SET payment_status_id = ?,
             paid_at = CASE WHEN ? = 2 THEN NOW() ELSE NULL END
         WHERE booking_id = ?`,
        [payment_status_id, payment_status_id, booking_id]
    );
};

// ─── Get full booking details by reference code ───────────────────────────────
export const getBookingByReference = async (reference: string) => {
    const [[booking]]: any = await db.query(
        `SELECT
            b.*,
            bs.status_name,
            h.name    AS hotel_name,
            h.address, h.city, h.country,
            u.first_name, u.last_name, u.email
         FROM bookings b
         JOIN booking_statuses bs ON b.booking_status_id = bs.booking_status_id
         JOIN hotels h             ON b.hotel_id          = h.hotel_id
         JOIN users u              ON b.user_id           = u.user_id
         WHERE b.booking_reference = ?`,
        [reference]
    );
    return booking;
};