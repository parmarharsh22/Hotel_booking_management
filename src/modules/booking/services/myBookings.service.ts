import { BookingListInterface,GuestBookingModel,BookingDetailInterface } from "../models/myBookings.model";

export class GuestBookingService {

  async getBookingsByUser(userId: number): Promise<BookingListInterface[]> {
    try {
      if (!userId) throw new Error("User ID is required.");
      const bookings = await GuestBookingModel.getBookingsByUser(userId);
      return bookings;
    } catch (err) {
      throw err;
    }
  }

  async getBookingDetail(bookingId: number, userId: number): Promise<BookingDetailInterface> {
    try {
      if (!bookingId) throw new Error("Booking ID is required.");
      if (!userId)    throw new Error("User ID is required.");
      const booking = await GuestBookingModel.getBookingDetail(bookingId, userId);
      if (!booking)   throw new Error("Booking not found.");
      return booking;
    } catch (err) {
      throw err;
    }
  }

}