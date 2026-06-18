import { db } from "../../../config/db";

export interface BookingListInterface {
  booking_id:        number;
  booking_reference: string;
  hotel_name:        string;
  hotel_city:        string;
  checkin_date:      Date;
  checkout_date:     Date;
  adults:            number;
  children:          number;
  total_amount:      number;
  status_name:       string;
  created_at:        Date;
}

export interface BookingDetailInterface extends BookingListInterface {
  special_requests:  string | null;
  source_name:       string;
  rooms:             RoomLineItem[];
}

export interface RoomLineItem {
  room_number:    string;
  type_name:      string;
  rate_per_night: number;
}

export class GuestBookingModel {

  // GET /bookings  →  listMyBookings
  // All bookings for this user across all hotels, newest first
  static async getBookingsByUser(userId: number): Promise<BookingListInterface[]> {
    try {
      const [rows]: any = await db.query(
        `SELECT
           b.booking_id,
           b.booking_reference,
           b.checkin_date,
           b.checkout_date,
           b.adults,
           b.children,
           b.total_amount,
           b.created_at,
           bs.status_name,
           h.name  AS hotel_name,
           h.city  AS hotel_city,
           h.logo_url AS hotel_logo
         FROM bookings b
         INNER JOIN booking_statuses bs ON b.booking_status_id = bs.booking_status_id
         INNER JOIN hotels            h  ON b.hotel_id         = h.hotel_id
         WHERE b.user_id = ?
         ORDER BY b.created_at DESC`,
        [userId]
      );
      return rows;
    } catch (err: any) {
      throw err;
    }
  }

  // GET /bookings/:bookingId  →  getBookingDetail
  // Full detail — scoped by user_id so guest can only see their own
  static async getBookingDetail(bookingId: number, userId: number): Promise<BookingDetailInterface | null> {
    try {
      const [rows]: any = await db.query(
        `SELECT
           b.booking_id,
           b.booking_reference,
           b.checkin_date,
           b.checkout_date,
           b.adults,
           b.children,
           b.total_amount,
           b.special_requests,
           b.created_at,
           bs.status_name,
           bsrc.source_name,
           h.hotel_id AS hotel_id,
           h.name  AS hotel_name,
           h.city  AS hotel_city,
           h.address AS hotel_address,
           h.logo_url  AS hotel_logo,
           h.cover_url AS hotel_cover
         FROM bookings b
         INNER JOIN booking_statuses bs   ON b.booking_status_id  = bs.booking_status_id
         INNER JOIN booking_sources  bsrc ON b.booking_source_id  = bsrc.booking_source_id
         INNER JOIN hotels           h    ON b.hotel_id           = h.hotel_id
         WHERE b.booking_id = ? AND b.user_id = ?`,
        [bookingId, userId]
      );
      if (!rows[0]) return null;
 
      // Room line items for this booking
      const [roomRows]: any = await db.query(
        `SELECT
           r.room_number,
           rt.type_name,
           br.rate_per_night
         FROM booking_rooms br
         INNER JOIN rooms      r  ON br.room_id      = r.room_id
         INNER JOIN room_types rt ON r.room_type_id  = rt.room_type_id
         WHERE br.booking_id = ?
         ORDER BY r.room_number ASC`,
        [bookingId]
      );

      return { ...rows[0], rooms: roomRows };
    } catch (err: any) {
      throw err;
    }
  }

}