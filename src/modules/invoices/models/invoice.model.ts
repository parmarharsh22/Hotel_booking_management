import { db } from "../../../config/db";

export interface InvoiceInterface {
  invoice_id?:    number;
  hotel_id:       number;
  booking_id:     number;
  room_charges:   number;
  incidentals:    number;
  tax_amount:     number;
  total_amount:   number;
  generated_at?:  Date;
}

export class InvoiceModel {

  // Booking core + guest + hotel info (tenant-scoped by hotel_id)
  static async getBookingCore(bookingId: number, hotelId: number): Promise<any | null> {
    try {
      const [rows]: any = await db.query(
        `SELECT 
           b.booking_id, b.hotel_id, b.user_id, b.booking_reference,
           b.checkin_date, b.checkout_date, b.adults, b.children,
           b.total_amount, b.booking_status_id,
           bs.status_name,
           u.first_name, u.last_name, u.email,
           h.name  AS hotel_name,
           h.address AS hotel_address,
           h.city  AS hotel_city,
           h.state AS hotel_state,
           h.logo_url AS hotel_logo,
           h.phone AS hotel_phone,
           h.email AS hotel_email
         FROM bookings b
         INNER JOIN booking_statuses bs ON b.booking_status_id = bs.booking_status_id
         INNER JOIN users           u  ON b.user_id            = u.user_id
         INNER JOIN hotels          h  ON b.hotel_id           = h.hotel_id
         WHERE b.booking_id = ? AND b.hotel_id = ?`,
        [bookingId, hotelId]
      );
      return rows[0] || null;
    } catch (err: any) {
      throw err;
    }
  }

  // Per-room line items for the booking
  static async getRoomLineItems(bookingId: number): Promise<any[]> {
    try {
      const [rows]: any = await db.query(
        `SELECT 
           br.booking_room_id,
           br.room_id,
           br.rate_per_night,
           r.room_number,
           rt.type_name
         FROM booking_rooms br
         INNER JOIN rooms      r  ON br.room_id      = r.room_id
         INNER JOIN room_types rt ON r.room_type_id = rt.room_type_id
         WHERE br.booking_id = ?
         ORDER BY r.room_number ASC`,
        [bookingId]
      );
      return rows;
    } catch (err: any) {
      throw err;
    }
  }

  // Incidental charges for the booking (tenant-scoped)
  static async getIncidentals(bookingId: number, hotelId: number): Promise<any[]> {
    try {
      const [rows]: any = await db.query(
        `SELECT incidental_id, description, amount, added_at
         FROM incidental_charges
         WHERE booking_id = ? AND hotel_id = ?
         ORDER BY added_at ASC`,
        [bookingId, hotelId]
      );
      return rows;
    } catch (err: any) {
      throw err;
    }
  }

  // The persisted invoice row, if any
  static async getInvoiceRow(bookingId: number, hotelId: number): Promise<InvoiceInterface | null> {
    try {
      const [rows]: any = await db.query(
        `SELECT * FROM invoices WHERE booking_id = ? AND hotel_id = ?`,
        [bookingId, hotelId]
      );
      return rows[0] || null;
    } catch (err: any) {
      throw err;
    }
  }

  // Insert-or-update — booking_id is UNIQUE (uq_booking_invoice)
  static async upsertInvoice(invoice: InvoiceInterface): Promise<void> {
    try {
      await db.query(
        `INSERT INTO invoices
           (hotel_id, booking_id, room_charges, incidentals, tax_amount, total_amount)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           room_charges = VALUES(room_charges),
           incidentals  = VALUES(incidentals),
           tax_amount   = VALUES(tax_amount),
           total_amount = VALUES(total_amount),
           generated_at = CURRENT_TIMESTAMP`,
        [
          invoice.hotel_id,
          invoice.booking_id,
          invoice.room_charges,
          invoice.incidentals,
          invoice.tax_amount,
          invoice.total_amount,
        ]
      );
    } catch (err: any) {
      throw err;
    }
  }

  static async getPayments(bookingId: number, hotelId: number): Promise<any[]> {
    try {
      const [rows]: any = await db.query(
        `SELECT 
           p.payment_id,
           p.amount,
           p.is_bypassed,
           p.paid_at,
           p.created_at,
           pm.method_name,
           ps.status_name
         FROM payments p
         INNER JOIN payment_methods  pm ON p.payment_method_id = pm.payment_method_id
         INNER JOIN payment_statuses ps ON p.payment_status_id = ps.payment_status_id
         WHERE p.booking_id = ? AND p.hotel_id = ?
         ORDER BY p.created_at ASC`,
        [bookingId, hotelId]
      );
      return rows;
    } catch (err: any) {
      throw err;
    }
  }


}