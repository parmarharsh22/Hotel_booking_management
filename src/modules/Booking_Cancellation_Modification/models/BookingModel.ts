import {db} from "../../../config/db";
import { PoolConnection } from "mysql2/promise";

export default class BookingModel {

    /*
    ===========================================
    DATABASE CONNECTION
    ===========================================
    */

    static async getConnection(): Promise<PoolConnection> {
        return await db.getConnection();
    }

    /*
    ===========================================
    GET BOOKING
    ===========================================
    */

    static async getBookingForModification(
        bookingId: number,
        userId: number
    ) {

        const [rows]: any = await db.query(
            `
           SELECT

b.*,

br.room_id,

r.room_number,

r.room_type_id,


rt.type_name,

h.name,
h.logo_url,
h.cover_url,
h.city,

h.address

FROM bookings b

INNER JOIN booking_rooms br
ON br.booking_id=b.booking_id

INNER JOIN rooms r
ON r.room_id=br.room_id

INNER JOIN room_types rt
ON rt.room_type_id=r.room_type_id

INNER JOIN hotels h
ON h.hotel_id=b.hotel_id

WHERE
b.booking_id=?
AND b.user_id=?

            LIMIT 1
            `,
            [
                bookingId,
                userId
            ]
        );

        return rows[0];
    }

    /*
    ===========================================
    GET ROOM
    ===========================================
    */

    static async getBookedRoom(
        bookingId: number
    ) {

        const [rows]: any = await db.query(
            `
            SELECT *

            FROM booking_rooms

            WHERE booking_id = ?
            `,
            [
                bookingId
            ]
        );

        return rows[0];
    }

    /*
    ===========================================
    CANCELLATION POLICY
    ===========================================
    */

    static async getCancellationPolicy(
        hotelId: number,
        roomTypeId: number
    ) {

        const [rows]: any = await db.query(
            `
            SELECT *

            FROM cancellation_policies

            WHERE

            hotel_id = ?

            AND

            room_type_id = ?
            `,
            [
                hotelId,
                roomTypeId
            ]
        );

        return rows[0];
    }

    /*
    ===========================================
    CHECK ROOM AVAILABILITY
    ===========================================
    */

    static async checkRoomAvailability(

        roomId: number,

        checkinDate: string,

        checkoutDate: string,

        bookingId: number

    ) {

        const [rows]: any = await db.query(

            `
            SELECT b.booking_id

            FROM bookings b

            INNER JOIN booking_rooms br

                ON br.booking_id=b.booking_id

            WHERE

                br.room_id=?

            AND

                b.booking_status_id IN (1,2)

            AND

                b.booking_id<>?

            AND

            (

                ? < b.checkout_date

            AND

                ? > b.checkin_date

            )
            `,
            [

                roomId,

                bookingId,

                checkinDate,

                checkoutDate

            ]
        );

        return rows.length === 0;
    }

    /*
    ===========================================
    UPDATE BOOKING
    ===========================================
    */

    static async updateBooking(

        connection: PoolConnection,

        bookingId: number,

        payload: any

    ) {

        await connection.query(

            `
            UPDATE bookings

            SET

                checkin_date=?,

                checkout_date=?,

                adults=?,

                children=?,

                special_requests=?

            WHERE booking_id=?
            `,

            [

                payload.checkin_date,

                payload.checkout_date,

                payload.adults,

                payload.children,

                payload.special_requests,

                bookingId

            ]

        );

    }

    /*
    ===========================================
    UPDATE ROOM
    ===========================================
    */

    static async updateBookingRoom(

        connection: PoolConnection,

        bookingId: number,

        roomId: number

    ) {

        await connection.query(

            `
            UPDATE booking_rooms

            SET room_id=?

            WHERE booking_id=?
            `,

            [

                roomId,

                bookingId

            ]

        );

    }

    /*
    ===========================================
    MODIFICATION HISTORY
    ===========================================
    */

    static async insertModificationHistory(

        connection: PoolConnection,

        history: any

    ) {

        await connection.query(

            `
            INSERT INTO booking_modifications(

                booking_id,

                modified_by,

                old_checkin_date,

                new_checkin_date,

                old_checkout_date,

                new_checkout_date,

                old_adults,

                new_adults,

                old_children,

                new_children,

                old_room_id,

                new_room_id

            )

            VALUES(

                ?,?,?,?,?,?,

                ?,?,?,?,

                ?,?

            )
            `,

            [

                history.booking_id,

                history.modified_by,

                history.old_checkin_date,

                history.new_checkin_date,

                history.old_checkout_date,

                history.new_checkout_date,

                history.old_adults,

                history.new_adults,

                history.old_children,

                history.new_children,

                history.old_room_id,

                history.new_room_id

            ]

        );

    }
/*
==================================================
GET BOOKING FOR EDIT PAGE
==================================================
*/

static async getBookingForEdit(

    bookingId: number,

    userId: number

) {

    const booking =
        await BookingModel.getBookingForModification(

            bookingId,

            userId

        );

    if (!booking) {

        throw new Error(

            "Booking not found."

        );

    }

    return booking;

}
/*
=====================================================
GET AVAILABLE ROOMS
=====================================================
*/

static async getAvailableRooms(

    hotelId: number,

    roomTypeId: number,

    checkinDate: string,

    checkoutDate: string,

    bookingId: number

) {

    const [rows]: any = await db.query(

        `
        SELECT

            r.room_id,
            r.room_number,
            rt.type_name

        FROM rooms r

        INNER JOIN room_types rt

            ON rt.room_type_id = r.room_type_id

        WHERE

            r.hotel_id = ?

        AND

            r.room_type_id = ?

        AND

            r.room_id NOT IN (

                SELECT br.room_id

                FROM bookings b

                INNER JOIN booking_rooms br

                    ON br.booking_id = b.booking_id

                WHERE

                    b.booking_status_id IN (1,2)

                AND

                    b.booking_id <> ?

                AND

                    (

                        ? < b.checkout_date

                    AND

                        ? > b.checkin_date

                    )

            )

        ORDER BY r.room_number
        `,

        [

            hotelId,

            roomTypeId,

            bookingId,

            checkinDate,

            checkoutDate

        ]

    );

    return rows;

}


}