import { Request, Response } from "express";
import { GuestBookingService } from "../services/myBookings.service";

const bookingService = new GuestBookingService();

export class GuestBookingController {

  // GET /bookings
  async listMyBookings(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId as number;
      const bookings = await bookingService.getBookingsByUser(userId);
      return res.status(200).render("myBookings/bookings", { bookings });
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  }

  // GET /bookings/:bookingId
  async getBookingDetail(req: Request, res: Response) {
    try {
      const userId    = (req as any).user?.userId as number;
      const bookingId = parseInt(req.params.bookingId as any);
      const booking   = await bookingService.getBookingDetail(bookingId, userId);
      return res.status(200).render("myBookings/detail", { booking });
    } catch (err: any) {
      return res.status(404).json({ message: err.message });
    }
  }

  // GET /notifications/data  → JSON for the bell dropdown
  async getNotifications(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId as number;
      const notifications = await bookingService.getRecentForNotifications(userId);
      return res.json({ notifications });
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  }

}