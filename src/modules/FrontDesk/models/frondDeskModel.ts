import { db } from "../../../config/db";
import type { FrontDeskUserRow, ArrivalRow, BookingDetailRow, VerificationPageRow, VerificationStatus, getAllCheckInGuest, CheckedOutRoom, renderIncidentals, } from "../types/frontDesk.types";
import type { RoomInventoryRow } from "../types/frontDesk.types";
import type { DashboardCounts, FloorOccupancyRow, RoomTypeUtilizationRow, ArrivalForecastRow, Incidental, PaymentList,InvoiceList } from "../types/frontDesk.types";
import { PoolConnection } from "mysql2/promise";

// get front desk user and hotel data
export const frontDeskData = async (
    userId: number
): Promise<FrontDeskUserRow | null> => {
    const [rows] = await db.query<any[]>(
        `
        SELECT h.name, u.first_name, u.last_name, u.photo_url
        FROM users u
        JOIN hotels h ON h.hotel_id = u.hotel_id
        WHERE u.user_id = ?
        `,
        [userId]
    );

    return rows.length > 0 ? (rows[0] as FrontDeskUserRow) : null;
};

// today's check-in count
export const getCheckinCount = async (hotelId: number): Promise<number> => {
    const [rows] = await db.query<any[]>(
        `
        SELECT COUNT(*) AS totalCheckins
        FROM bookings b
        JOIN booking_statuses bs ON bs.booking_status_id = b.booking_status_id
        WHERE b.hotel_id = ?
          AND b.checkin_date = CURDATE()
          AND bs.status_name = 'CONFIRMED'
        `,
        [hotelId]
    );

    return Number(rows[0]?.totalCheckins) || 0;
};

// today's check-out count
export const getCheckoutCount = async (hotelId: number): Promise<number> => {
    const [rows] = await db.query<any[]>(
        `
        SELECT COUNT(*) AS totalCheckouts
        FROM bookings b
        JOIN booking_statuses bs ON bs.booking_status_id = b.booking_status_id
        WHERE b.hotel_id = ?
          AND b.checkout_date = CURDATE()
          AND bs.status_name = 'CHECKED_IN'
        `,
        [hotelId]
    );

    return Number(rows[0]?.totalCheckouts) || 0;
};

// occupancy percentage
export const getOccupancy = async (hotelId: number): Promise<number> => {
    const [rows] = await db.query<any[]>(
        `
        SELECT
          ROUND(
            (
              COUNT(DISTINCT br.room_id) * 100.0
            ) /
            (
              SELECT COUNT(*)
              FROM rooms
              WHERE hotel_id = ?
            ),
            2
          ) AS occupancy
        FROM bookings b
        JOIN booking_rooms br ON br.booking_id = b.booking_id
        JOIN rooms r ON r.room_id = br.room_id
        WHERE r.hotel_id = ?
          AND CURDATE() >= b.checkin_date
          AND CURDATE() < b.checkout_date
          AND b.booking_status_id IN (2,3)
        `,
        [hotelId, hotelId]
    );

    return Number(rows[0]?.occupancy) || 0;
};

// today's upcoming arrivals
export const getUpcomingArrivals = async (
    hotelId: number
): Promise<ArrivalRow[]> => {
    const [rows] = await db.query<any[]>(
        `
        SELECT
          b.booking_id,
          b.booking_reference,
          b.user_id,
          u.first_name,
          u.last_name,
          u.photo_url,
          b.checkin_date,
          COUNT(br.room_id) AS total_rooms,
          GROUP_CONCAT(DISTINCT r.room_number
                       ORDER BY r.room_number SEPARATOR ', ')  AS room_numbers,
          GROUP_CONCAT(DISTINCT rs.status_name
                       ORDER BY rs.status_name SEPARATOR ', ') AS room_statuses
        FROM bookings b
        JOIN users u          ON u.user_id    = b.user_id
        JOIN booking_rooms br ON br.booking_id = b.booking_id
        JOIN rooms r          ON r.room_id     = br.room_id
        JOIN room_statuses rs ON rs.room_status_id = r.room_status_id
        WHERE b.hotel_id = ?
          AND DATE(b.checkin_date) = CURDATE()
          AND booking_status_id = 2
        GROUP BY
          b.booking_id,
          b.booking_reference,
          b.user_id,
          u.first_name,
          u.last_name,
          u.photo_url,
          b.checkin_date
        ORDER BY b.created_at DESC
        `,
        [hotelId]
    );

    return rows as ArrivalRow[];
};

// full booking details for confirmation screen
export const getBookingDetails = async (
    bookingRef: string
): Promise<BookingDetailRow | null> => {
    const [rows] = await db.query<BookingDetailRow[]>(
        `
        SELECT
          b.booking_id, b.booking_reference,
          b.checkin_date, b.checkout_date,
          b.adults, b.children,
          b.total_amount, b.special_requests,
          br.booking_room_id, br.rate_per_night,
          r.room_id, r.room_number, r.floor,
          rt.room_type_id, rt.type_name, rt.base_price,
          (rt.max_adults + rt.max_children) AS capacity,
          u.photo_url, rt.description,
          u.user_id, u.first_name, u.last_name,
          u.email, u.phone, u.dob, u.gender,
          u.address, u.city, u.state
        FROM bookings b
        JOIN users u          ON u.user_id       = b.user_id
        JOIN booking_rooms br ON br.booking_id   = b.booking_id
        JOIN rooms r          ON r.room_id       = br.room_id
        JOIN room_types rt    ON rt.room_type_id = r.room_type_id
        WHERE b.booking_reference = ?
        `,
        [bookingRef]
    );

    return rows.length > 0 ? (rows[0] as BookingDetailRow) : null;
};

// minimal data for document gathering screen
export const getVerificationPageData = async (
    bookingReference: string
): Promise<VerificationPageRow | null> => {
    const [rows] = await db.query<VerificationPageRow[]>(
        `
        SELECT
          b.booking_id, b.booking_reference,
          u.user_id, u.first_name, u.last_name, u.phone
        FROM bookings b
        JOIN users u ON u.user_id = b.user_id
        WHERE b.booking_reference = ?
        `,
        [bookingReference]
    );

    return rows.length > 0 ? (rows[0] as VerificationPageRow) : null;
};

// insert into guest_identifications
export const insertIntoGuestIdentifier = async (
    booking_id: string,
    user_id: number,
    staff_id: number,
    id_type_id: string,
    id_number: string,
    documentUrl: string | null,
    verification_status: VerificationStatus,
    remarks: string
): Promise<void> => {
    await db.query(
        `
        INSERT INTO guest_identifications
          (booking_id, user_id, verified_by, id_type_id,
           id_number, document_url, verification_status, remarks)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            booking_id,
            user_id,
            staff_id,
            id_type_id,
            id_number,
            documentUrl,
            verification_status,
            remarks,
        ]
    );
};

// update booking status after verification
export const updateRoomState = async (
    verificationStatus: VerificationStatus,
    bookingId: string
): Promise<void> => {
    // approved => checked_in (3), failed => cancelled (5)
    const statusId: number = verificationStatus === "APPROVED" ? 3 : 5;

    await db.query(
        `UPDATE bookings SET booking_status_id = ? WHERE booking_id = ?`,
        [statusId, bookingId]
    );



};

// room inventory with live status for each room
export const getRoomStatuses = async (
    hotelId: number
): Promise<RoomInventoryRow[]> => {
    const [rows] = await db.query<RoomInventoryRow[]>(
        `
        SELECT
            r.room_number,
            r.floor,
            rt.type_name,
            (rt.max_adults + rt.max_children) as capacity,

            CASE
                WHEN rs.status_name = 'MAINTENANCE' THEN 'MAINTENANCE'
                WHEN rs.status_name = 'DIRTY' THEN 'DIRTY'
                WHEN ab.booking_id IS NOT NULL THEN 'OCCUPIED'
                ELSE 'VACANT'
            END AS room_status,

            ab.booking_reference,
            ab.checkout_date,
            ab.guest_name AS current_guest

        FROM rooms r

        JOIN room_types rt
            ON rt.room_type_id = r.room_type_id

        JOIN room_statuses rs
            ON rs.room_status_id = r.room_status_id

        LEFT JOIN (
    SELECT
        x.room_id,
        x.booking_id,
        x.booking_reference,
        x.checkout_date,
        x.guest_name
    FROM (
        SELECT
            br.room_id,
            b.booking_id,
            b.booking_reference,
            b.checkout_date,
            CONCAT(u.first_name,' ',u.last_name) AS guest_name,

            ROW_NUMBER() OVER (
                PARTITION BY br.room_id
                ORDER BY b.checkout_date DESC, b.booking_id DESC
            ) AS rn

            FROM booking_rooms br
            JOIN bookings b ON b.booking_id = br.booking_id
            JOIN users u    ON u.user_id    = b.user_id

                WHERE b.booking_status_id = 3   -- ← only status drives occupancy, not dates
            ) x
            WHERE x.rn = 1

        ) ab ON ab.room_id = r.room_id

        WHERE r.hotel_id = ?

        ORDER BY r.floor DESC, r.room_number
        `,
        [hotelId]
    );

    return rows;
};

// get all room counts: occupied, vacant, maintenance
export const getAllCounts = async (
    hotelId: number
): Promise<DashboardCounts> => {
    const [rows] = await db.query<DashboardCounts[]>(
        `
        SELECT
            SUM(
                CASE
                    WHEN rs.status_name = 'MAINTENANCE' THEN 1
                    ELSE 0
                END
            ) AS maintenance,

            SUM(
                CASE
                    WHEN b.booking_id IS NOT NULL THEN 1
                    ELSE 0
                END
            ) AS occupied,

            SUM(
                CASE
                    WHEN rs.status_name <> 'MAINTENANCE'
                    AND b.booking_id IS NULL THEN 1
                    ELSE 0
                END
            ) AS vacant

        FROM rooms r

        JOIN room_statuses rs
            ON rs.room_status_id = r.room_status_id

        LEFT JOIN booking_rooms br
            ON br.room_id = r.room_id

        LEFT JOIN bookings b
            ON b.booking_id = br.booking_id
            AND CURDATE() >= b.checkin_date
            AND CURDATE() < b.checkout_date
            AND b.booking_status_id = 3

        WHERE r.hotel_id = ?
        `,
        [hotelId]
    );

    return rows[0] as DashboardCounts;
};

// occupied rooms grouped by floor
export const getFloorOccupancy = async (
    hotelId: number
): Promise<FloorOccupancyRow[]> => {
    const [rows] = await db.query<FloorOccupancyRow[]>(
        `
        SELECT
            r.floor,
            COUNT(*) AS occupied

        FROM rooms r

        JOIN booking_rooms br ON br.room_id   = r.room_id
        JOIN bookings b       ON b.booking_id = br.booking_id
            AND CURDATE() >= b.checkin_date
            AND CURDATE() < b.checkout_date
            AND b.booking_status_id = 3

        WHERE r.hotel_id = ?

        GROUP BY r.floor
        ORDER BY r.floor
        `,
        [hotelId]
    );

    return rows as FloorOccupancyRow[];
};

// occupied rooms grouped by room type
export const getRoomTypeUtilization = async (
    hotelId: number
): Promise<RoomTypeUtilizationRow[]> => {
    const [rows] = await db.query<RoomTypeUtilizationRow[]>(
        `
        SELECT
            rt.type_name,
            COUNT(*) AS occupied

        FROM rooms r

        JOIN room_types rt    ON rt.room_type_id = r.room_type_id
        JOIN booking_rooms br ON br.room_id      = r.room_id
        JOIN bookings b       ON b.booking_id    = br.booking_id
            AND CURDATE() >= b.checkin_date
            AND CURDATE() < b.checkout_date
            AND b.booking_status_id = 3

        WHERE r.hotel_id = ?

        GROUP BY rt.type_name
        ORDER BY occupied DESC
        `,
        [hotelId]
    );

    return rows as RoomTypeUtilizationRow[];
};

// arrivals for the next 7 days
export const getArrivalForecast = async (
    hotelId: number
): Promise<ArrivalForecastRow[]> => {
    const [rows] = await db.query<ArrivalForecastRow[]>(
        `
        SELECT
            DATE(checkin_date) AS arrival_date,
            COUNT(*) AS total

        FROM bookings

        WHERE hotel_id = ?
          AND checkin_date >= CURDATE()
          AND booking_status_id IN (1,2,3)

        GROUP BY DATE(checkin_date)
        ORDER BY arrival_date
        LIMIT 7
        `,
        [hotelId]
    );

    return rows as ArrivalForecastRow[];
};

// checked in bookings past their checkout date
export const getLateCheckouts = async (hotelId: number): Promise<number> => {
    const [rows] = await db.query<any[]>(
        `
        SELECT COUNT(*) AS lateCheckouts
        FROM bookings b
        JOIN booking_statuses bs ON bs.booking_status_id = b.booking_status_id
        WHERE b.hotel_id = ?
          AND bs.status_name = 'CHECKED_IN'
          AND b.checkout_date < CURDATE()
        `,
        [hotelId]
    );

    return Number(rows[0]?.lateCheckouts) || 0;
};

// get all the hotel bookings
export const fetchBookings = async (sql: string, params: any[]) => {
    const [rows] = await db.query(sql, params);
    return rows;
};

export const fetchBookingsCount = async (sql: string, params: any[]) => {
    const [rows]: any = await db.query(sql, params);
    return rows[0]?.total || 0;
};

// get all the checked-in guests
export const getAllCheckInGuests = async (
    hotelId: number
): Promise<getAllCheckInGuest[]> => {
    const [rows] = await db.query<getAllCheckInGuest[]>(
        `
        SELECT
            b.booking_id,
            b.booking_reference,
            u.first_name,
            u.last_name,
            COUNT(br.room_id) AS total_rooms,
            b.checkin_date,
            b.checkout_date
        FROM bookings b
        JOIN users u          ON u.user_id       = b.user_id
        JOIN booking_rooms br ON br.booking_id   = b.booking_id
        JOIN booking_statuses bs ON bs.booking_status_id = b.booking_status_id
        WHERE bs.status_name = 'CHECKED_IN'
          AND b.hotel_id = ?
        GROUP BY
            b.booking_id,
            b.booking_reference,
            u.first_name,
            u.last_name,
            b.checkin_date,
            b.checkout_date
        `,
        [hotelId]
    );

    return rows as getAllCheckInGuest[];
};

// mark the booking as checked out
export const markBookingAsCheckedOut = async (
    conn: PoolConnection,
    bookingReference: string,
    hotelId: number
) => {
    await conn.query(
        `
        UPDATE bookings
        SET booking_status_id = (
            SELECT booking_status_id
            FROM booking_statuses
            WHERE status_name = 'CHECKED_OUT'
        )
        WHERE booking_reference = ?
          AND hotel_id = ?
        `,
        [bookingReference, hotelId]
    );
};

// get the rooms to release for cleaning
export const getBookingRooms = async (
    conn: PoolConnection,
    bookingReference: string,
    hotelId: number
): Promise<CheckedOutRoom[]> => {
    const [rows] = await conn.query<CheckedOutRoom[]>(
        `
        SELECT
            r.room_id,
            r.room_number
        FROM rooms r
        JOIN booking_rooms br ON br.room_id    = r.room_id
        JOIN bookings b       ON b.booking_id  = br.booking_id
        WHERE b.booking_reference = ?
          AND b.hotel_id = ?
        `,
        [bookingReference, hotelId]
    );

    return rows;
};

// mark the released rooms as dirty
export const markRoomsDirty = async (
    conn: PoolConnection,
    bookingReference: string,
    hotelId: number
) => {
    await conn.query(
        `
        UPDATE rooms r
        JOIN booking_rooms br ON br.room_id   = r.room_id
        JOIN bookings b       ON b.booking_id = br.booking_id
        SET r.room_status_id = (
            SELECT room_status_id
            FROM room_statuses
            WHERE status_name = 'DIRTY'
        )
        WHERE b.booking_reference = ?
          AND b.hotel_id = ?
        `,
        [bookingReference, hotelId]
    );
};

// mark a cleaned room as available
export const markRoomAvailable = async (roomId: number) => {
    await db.query(
        `
        UPDATE rooms
        SET room_status_id = (
            SELECT room_status_id
            FROM room_statuses
            WHERE status_name = 'AVAILABLE'
        )
        WHERE room_id = ?
        `,
        [roomId]
    );
};

// fetch all rooms currently sitting in dirty state across all hotels
export const getAllDirtyRooms = async (): Promise<{ room_id: number; hotel_id: number }[]> => {
    const [rows] = await db.query<any[]>(
        `
        SELECT r.room_id, r.hotel_id
        FROM rooms r
        JOIN room_statuses rs ON rs.room_status_id = r.room_status_id
        WHERE rs.status_name = 'DIRTY'
        `
    );

    return rows;
};

//once user is approved and checkedIn mark the room as occupied in the global db
export const markRoomsOccupied = async (bookingId: string): Promise<void> => {
    await db.query(
        `UPDATE rooms r
        JOIN booking_rooms br ON br.room_id   = r.room_id
        JOIN bookings b       ON b.booking_id = br.booking_id
        SET r.room_status_id = (
            SELECT room_status_id
            FROM room_statuses
            WHERE status_name = 'OCCUPIED'
        )
        WHERE b.booking_id = ?
        `,
        [bookingId]
    );
};

//render the incidentails added with anyPerson
export const renderIncidential = async (hotelId: number): Promise<renderIncidentals[]> => {
    const [rows] = await db.query<renderIncidentals[]>(
        `SELECT
            b.booking_id,
            b.booking_reference,
            b.checkin_date,
            b.checkout_date,

            u.first_name,
            u.last_name,

            bs.status_name,

            COUNT(br.room_id) AS total_rooms


        FROM bookings b

        INNER JOIN users u
            ON u.user_id = b.user_id

        INNER JOIN booking_statuses bs
            ON bs.booking_status_id = b.booking_status_id

        LEFT JOIN booking_rooms br
            ON br.booking_id = b.booking_id

        WHERE
            b.hotel_id = ?
            AND bs.status_name IN ('CONFIRMED','CHECKED_IN')

        GROUP BY
            b.booking_id

        ORDER BY
            b.created_at DESC;
        `, [hotelId]);

    return rows
};

//get all the incidentails to manage upon
export const getBookingIncidentals = async (
    hotelId: number,
    bookingId: number
): Promise<Incidental[]> => {

    const [rows] = await db.query<Incidental[]>(`
        SELECT
            i.incidental_id,
            i.booking_id,
            i.description,
            i.amount,
            i.added_at,

            CONCAT(
                u.first_name,
                ' ',
                u.last_name
            ) AS added_by_name

        FROM incidental_charges i

        INNER JOIN users u
            ON u.user_id = i.added_by

        WHERE
            i.booking_id = ?
            AND i.hotel_id = ?

        ORDER BY
            i.added_at DESC,
            i.incidental_id DESC
    `, [bookingId, hotelId]);

    return rows;
};

//get the booking details of the user demanded a extra service
export const getBookingDetailsForIncidental = async (
    hotelId: number,
    bookingId: number
) => {

    const [rows] = await db.query<any[]>(`
        SELECT
            b.booking_id,
            b.booking_reference,
            b.checkin_date,
            b.checkout_date,

            bs.status_name,

            u.first_name,
            u.last_name,

            GROUP_CONCAT(
                r.room_number
                ORDER BY r.room_number
                SEPARATOR ', '
            ) AS room_numbers

        FROM bookings b

        INNER JOIN users u
            ON u.user_id = b.user_id

        INNER JOIN booking_statuses bs
            ON bs.booking_status_id = b.booking_status_id

        LEFT JOIN booking_rooms br
            ON br.booking_id = b.booking_id

        LEFT JOIN rooms r
            ON r.room_id = br.room_id

        WHERE
            b.booking_id = ?
            AND b.hotel_id = ?

        GROUP BY
            b.booking_id
    `, [bookingId, hotelId]);

    return rows.length > 0 ? rows[0] : null;
}

//add a extra service
export const addIncidental = async (hotelId: number, bookingId: number, addedBy: number, description: string, amount: number) => {
    await db.query(`INSERT INTO incidental_charges(hotel_id,booking_id,added_by,description,amount) VALUES (?,?,?,?,?)`, [
        hotelId,
        bookingId,
        addedBy,
        description,
        amount
    ]);
}

//delete any incidentalService
export const deleteIncidental = async (hotelId: number, incidentalId: number) => {
    await db.query(`DELETE FROM incidental_charges WHERE incidental_id = ? AND hotel_id = ?`, [incidentalId, hotelId]);
}

//get all the payement from the db
export const getPayments = async (
    hotelId: number
): Promise<PaymentList[]> => {

    const [rows] = await db.query<PaymentList[]>(`
    SELECT
        p.payment_id,
        p.booking_id,
        b.booking_reference,
        CONCAT(u.first_name, ' ', u.last_name) AS guest_name,
        r.room_number,
        p.amount,
        pm.method_name,
        ps.status_name,
        p.is_bypassed,
        p.paid_at,
        p.created_at
            FROM payments p
            INNER JOIN bookings b ON p.booking_id = b.booking_id
            INNER JOIN users u ON b.user_id = u.user_id
            INNER JOIN booking_rooms br ON b.booking_id = br.booking_id
            INNER JOIN rooms r ON br.room_id = r.room_id
            INNER JOIN payment_methods pm ON p.payment_method_id = pm.payment_method_id
            INNER JOIN payment_statuses ps ON p.payment_status_id = ps.payment_status_id
            WHERE p.hotel_id = ?
            ORDER BY p.created_at DESC;
    `, [hotelId]);

    return rows;

};

// get all the invoices from the db
export const getInvoices = async (
    hotelId: number
): Promise<InvoiceList[]> => {

    const [rows] = await db.query<InvoiceList[]>(`

        SELECT

            i.invoice_id,
            i.booking_id,
            b.booking_reference,

            CONCAT(
                u.first_name,
                ' ',
                u.last_name
            ) AS guest_name,

            r.room_number,

            i.room_charges,
            i.incidentals,
            i.tax_amount,
            i.total_amount,
            i.generated_at

        FROM invoices i

        INNER JOIN bookings b
            ON i.booking_id = b.booking_id

        INNER JOIN users u
            ON b.user_id = u.user_id

        INNER JOIN booking_rooms br
            ON b.booking_id = br.booking_id

        INNER JOIN rooms r
            ON br.room_id = r.room_id

        WHERE

            i.hotel_id = ?

        ORDER BY

            i.generated_at DESC;

    `, [hotelId]);

    return rows;

};