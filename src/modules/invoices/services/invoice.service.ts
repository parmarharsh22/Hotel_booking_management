import dayjs from "dayjs";
import { InvoiceModel } from "../models/invoice.model";

// Single place to change the tax rate. 0.12 = 12% GST.
const TAX_RATE = 0.12;

export class InvoiceService {

  /**
   * Compiles room charges + incidentals + tax, upserts the invoice row,
   * and returns the full breakdown for rendering.
   */
  async generateInvoice(bookingId: number, hotelId: number): Promise<any> {
    try {
      if (!bookingId) throw new Error("Booking ID is required.");
      if (!hotelId)   throw new Error("Hotel ID is required.");

      const booking = await InvoiceModel.getBookingCore(bookingId, hotelId);
      if (!booking) throw new Error("Booking not found.");

      let nights = dayjs(booking.checkout_date).diff(dayjs(booking.checkin_date), "day");
      if (nights < 1) nights = 1;

      const lineItems = await InvoiceModel.getRoomLineItems(bookingId);
      const perNight  = lineItems.reduce((sum, li) => sum + parseFloat(li.rate_per_night), 0);
      const room_charges = +(perNight * nights).toFixed(2);

      const incidentals = await InvoiceModel.getIncidentals(bookingId, hotelId);
      const incidentals_total = +(incidentals.reduce((s, i) => s + parseFloat(i.amount), 0)).toFixed(2);

      const tax_amount   = +(((room_charges + incidentals_total) * TAX_RATE)).toFixed(2);
      const total_amount = +((room_charges + incidentals_total + tax_amount)).toFixed(2);

      await InvoiceModel.upsertInvoice({
        hotel_id:     hotelId,
        booking_id:   bookingId,
        room_charges,
        incidentals:  incidentals_total,
        tax_amount,
        total_amount,
      });

      // Payments — for display only; the invoices table doesn't store paid/balance
      const payments = await InvoiceModel.getPayments(bookingId, hotelId);
      const amount_paid = +(payments
        .filter(p => p.status_name === "SUCCESS" || p.status_name === "BYPASSED")
        .reduce((s, p) => s + parseFloat(p.amount), 0)).toFixed(2);
      const balance_due = +((total_amount - amount_paid)).toFixed(2);

      return {
        booking,
        nights,
        lineItems,
        incidentals,
        room_charges,
        incidentals_total,
        tax_rate: TAX_RATE,
        tax_amount,
        payments,
        amount_paid,
        balance_due,
        total_amount,
      };
    } catch (err) {
      throw err;
    }
  }

}