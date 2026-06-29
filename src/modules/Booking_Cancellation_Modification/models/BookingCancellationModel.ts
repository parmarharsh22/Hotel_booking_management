import { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { db } from "../../../config/db";

class BookingCancellationModel {

    static async getBookingForCancellation(
        bookingId: number,
        userId: number
    ): Promise<any | null> {

        const [rows] = await db.query<(RowDataPacket & any)[]>(`
            SELECT
                b.booking_id,
                b.booking_reference,
                b.hotel_id,
                h.name,
                h.cover_url,
                b.user_id,
                b.booking_status_id,
                bs.status_name,
                b.checkin_date,
                b.checkout_date,
                b.total_amount,
                b.adults,
                b.children,
                br.booking_room_id,
                br.room_id,
                br.rate_per_night,
                r.room_number,
                r.room_type_id,
                rt.type_name,
                p.payment_id,
                p.amount,
                p.payment_status_id
            FROM bookings b
            INNER JOIN hotels h 
                ON h.hotel_id = b.hotel_id
            INNER JOIN booking_statuses bs
                ON bs.booking_status_id = b.booking_status_id
            INNER JOIN booking_rooms br
                ON br.booking_id = b.booking_id
            INNER JOIN rooms r
                ON r.room_id = br.room_id
            INNER JOIN room_types rt
                ON rt.room_type_id = r.room_type_id
            LEFT JOIN payments p
                ON p.booking_id = b.booking_id
            WHERE
                b.booking_id = ?
                AND b.user_id = ?
            LIMIT 1
        `, [bookingId, userId]);

        return rows.length ? rows[0] : null;
    }

    static async getCancellationPolicy(
        hotelId: number,
        roomTypeId: number
    ): Promise<any | null> {

        const [rows] = await db.query<(RowDataPacket & any)[]>(`
            SELECT
                policy_id,
                free_cancellation_hours,
                refund_percentage
            FROM cancellation_policies
            WHERE
                hotel_id = 1
                AND room_type_id = 1
            LIMIT 1
        `, [hotelId, roomTypeId]);

        return rows.length ? rows[0] : null;
    }

    static async insertCancellationHistory(
        connection: PoolConnection,
        data: {
            bookingId: number;
            cancelledBy: number;
            reason: string;
            remarks: string;
            refundPercentage: number;
            refundAmount: number;
            cancellationCharge: number;
        }
    ): Promise<number> {

        const [result] = await connection.execute<ResultSetHeader>(`
            INSERT INTO booking_cancellations
            (
                booking_id,
                cancelled_by,
                cancellation_reason,
                remarks,
                refund_percentage,
                refund_amount,
                cancellation_charge
            )
            VALUES
            (?, ?, ?, ?, ?, ?, ?)
        `,
        [
            data.bookingId,
            data.cancelledBy,
            data.reason,
            data.remarks,
            data.refundPercentage,
            data.refundAmount,
            data.cancellationCharge
        ]);

        return result.insertId;
    }

    static async updateBookingStatus(
        connection: PoolConnection,
        bookingId: number,
        cancelledStatusId: number
    ): Promise<void> {

        await connection.execute(`
            UPDATE bookings
            SET
                booking_status_id = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE booking_id = ?
        `, [cancelledStatusId, bookingId]);
    }

    static async updatePaymentRefund(
        connection: PoolConnection,
        paymentId: number,
        paymentStatusId: number
    ): Promise<void> {

        await connection.execute(`
            UPDATE payments
            SET
                payment_status_id = ?
            WHERE payment_id = ?
        `, [paymentStatusId, paymentId]);
    }

    static async releaseBookedRooms(
        connection: PoolConnection,
        bookingId: number
    ): Promise<void> {

        await connection.execute(`
            DELETE
            FROM booking_rooms
            WHERE booking_id = ?
        `, [bookingId]);
    }

    static async getConnection(): Promise<PoolConnection> {
        return await db.getConnection();
    }
}

export default BookingCancellationModel;