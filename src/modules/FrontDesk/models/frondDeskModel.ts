import { db } from "../../../config/db";

// get front desk user data
export const frontDeskData = async (
    userId: number
) => {

    const [rows]: any = await db.query(`
        SELECT h.name, u.first_name, u.last_name, u.photo_url
        FROM users u
        JOIN hotels h
            ON h.hotel_id = u.hotel_id
        WHERE u.user_id = ?
    `, [userId]);

    return rows.length > 0
        ? rows[0]
        : null;
};


// get today's check-in count
export const getCheckinCount = async (
    hotelId: number
) => {

    const [rows]: any = await db.query(`
        SELECT COUNT(*) AS totalCheckins
        FROM bookings b JOIN booking_statuses bs
            ON bs.booking_status_id = b.booking_status_id
        WHERE b.hotel_id = ?
        AND b.checkin_date = CURDATE()
        AND bs.status_name = 'CONFIRMED'
    `, [hotelId]);

    return rows[0]?.totalCheckins || 0;
};


// get today's check-out count
export const getCheckoutCount = async (
    hotelId: number
) => {

    const [rows]: any = await db.query(`
        SELECT COUNT(*) AS totalCheckouts
        FROM bookings b JOIN booking_statuses bs
            ON bs.booking_status_id = b.booking_status_id
        WHERE b.hotel_id = ?
        AND b.checkout_date = CURDATE()
        AND bs.status_name = 'CHECKED_IN'
    `, [hotelId]);

    return rows[0]?.totalCheckouts || 0;
};


// get occupancy percentage
export const getOccupancy = async (
    hotelId: number
) => {

    const [rows]: any = await db.query(`
        SELECT
            ROUND((SUM( CASE
                            WHEN ast.status_name = 'BOOKED'
                            THEN 1
                            ELSE 0
                        END
                    ) * 100) / COUNT(*),2) AS occupancy
        FROM room_availability ra JOIN rooms r
            ON r.room_id = ra.room_id
        JOIN availability_statuses ast
            ON ast.availability_status_id = ra.availability_status_id
        WHERE r.hotel_id = ?
        AND ra.date = CURDATE()
    `, [hotelId]);

    return rows[0]?.occupancy || 0;
};


// get today's arrivals
export const getUpcomingArrivals = async (
    hotelId: number
) => {
    const [rows]: any = await db.query(`
        SELECT b.booking_id, b.booking_reference,b.user_id,u.first_name,u.last_name,u.photo_url,b.checkin_date,
        COUNT(br.room_id) AS total_rooms,
        GROUP_CONCAT(
        DISTINCT r.room_number
        ORDER BY r.room_number
        SEPARATOR ', '
    ) AS room_numbers,

        GROUP_CONCAT(
        DISTINCT rs.status_name
        ORDER BY rs.status_name
        SEPARATOR ', '
    ) AS room_statuses

        FROM bookings b
    JOIN users u
    ON u.user_id = b.user_id

    JOIN booking_rooms br
    ON br.booking_id = b.booking_id

    JOIN rooms r
    ON r.room_id = br.room_id

    JOIN room_statuses rs
    ON rs.room_status_id = r.room_status_id

    WHERE b.hotel_id = ?
        AND DATE(b.checkin_date) = CURDATE()

    GROUP BY
        b.booking_id,
        b.booking_reference,
        b.user_id,
        u.first_name,
        u.last_name,
        u.photo_url,
        b.checkin_date

    ORDER BY b.created_at DESC;`, [hotelId]);
    return rows;
};
//gather all the booking Details to confirm the user
export const getBookingDetails = async (book_id: string) => {
    const [rows]: any = await db.query(`
    SELECT b.booking_id,b.booking_reference,b.checkin_date,b.checkout_date,b.adults,b.children,
        b.total_amount,b.special_requests,br.booking_room_id,br.rate_per_night,r.room_id,r.room_number,r.floor,
        rt.room_type_id,rt.type_name,rt.base_price,(rt.max_adults + rt.max_children) AS capacity,
        rt.photo_url,rt.description,u.user_id,u.first_name,u.last_name,u.email,
        u.phone,u.dob,u.gender,u.address,u.city,u.state,u.photo_url
    FROM bookings b

    JOIN users u
        ON u.user_id = b.user_id

    JOIN booking_rooms br
        ON br.booking_id = b.booking_id

    JOIN rooms r
        ON r.room_id = br.room_id

    JOIN room_types rt
        ON rt.room_type_id = r.room_type_id

    WHERE b.booking_reference = ?;
    `, [book_id]);

    return rows.length > 0 ? rows[0] : null;
}

//display the data at the document gathering phase

export const getVerificationPageData = async (booking_reference: string) => {
    const [rows]: any = await db.query(`
    SELECT b.booking_id,b.booking_reference,u.user_id,
        u.first_name,u.last_name,u.phone
    FROM bookings b

    JOIN users u
        ON u.user_id = b.user_id

    WHERE b.booking_reference = ?;
    `, [booking_reference]);

    return rows.length > 0 ? rows[0] : null;
};

export const insertIntoGuestIdentifier = async (
    booking_id: string,
    user_id: number,
    id_type_id: number,
    id_number: string,
    verification_status: string,
    documentUrl: string | null,
    remarks: string,
    staff_id: number
) => {
    await db.query(`
            INSERT INTO guest_identifications (booking_id,user_id,verified_by,id_type_id,id_number,document_url,verification_status,remarks)
            VALUES (?, ?, ?, ?, ?, ?)`, [
        booking_id,
        user_id,
        staff_id,
        id_type_id,
        id_number,
        documentUrl,
        verification_status,
        remarks
    ]);
}

export const updateRoomState = async (verfi_status: string, book_id: string) => {
    await db.query(`UPDATE bookings SET booking_status_id = ? WHERE booking_id = ?`,
         [verfi_status === "APPROVED"? 2: 3,book_id]);
}