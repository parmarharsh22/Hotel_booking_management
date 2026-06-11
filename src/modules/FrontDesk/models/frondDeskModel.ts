import { db } from "../../../config/db";

export const frontDeskData = async (hotel_Id: number, uid: number) => {
    const [rows]: any = await db.query(`
    SELECT h.name,u.first_name,u.last_name,u.photo_url
    FROM users as u JOIN hotels as h ON h.hotel_id = u.hotel_id
    where user_id = ?`, [uid]);

    return rows.length > 0 ? rows[0] : null;

}

export const hotelData = async (hotelId: number) => {
    const [rows]: any = await db.query(`
        SELECT COUNT(*) totalCheckins
        FROM bookings b
        JOIN booking_statuses bs
        ON b.booking_status_id = bs.booking_status_id
        WHERE DATE(b.checkin_date)=CURDATE()
        AND bs.status_name='CONFIRMED' AND b.hotel_id = ?`, [hotelId]);
    
    return rows.length > 0 ? rows[0].totalCheckins : null;
}