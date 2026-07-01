import { Request, Response } from "express";
import BookingCancellationService from "../services/BookingCancellationService";

class BookingCancellationController {

    async showCancellationPage(req: Request, res: Response): Promise<Response | void> {
        try {
            const bookingId = Number(req.params.bookingId);
            const userId = (req as any).user?.userId as number;
            const hotelId = (req as any).hotelId as number;
            console.log("hotelid",hotelId);
            
            const preview = await BookingCancellationService.getCancellationPreview(bookingId, userId);

            return res.render("myBookings/cancel-booking", {
                booking: preview.booking,
                policy: preview.policy,
                refund: preview.refund
            });
        } catch (error: any) {
            res.json
            console.error("Error showing cancellation page: ", error);
            return res.status(400).send(`<h3>Error packing cancellation view: ${error.message}</h3>`);
        }
    }

    async cancelBooking(req: Request, res: Response): Promise<Response | void> {
        try {
            const bookingId = Number(req.params.bookingId);
            const userId = (req as any).user?.userId as number;

            const { reason, remarks } = req.body;

            if (!reason) {
                return res.status(400).json({
                    success: false,
                    message: "Cancellation reason is required."
                });
            }

            const result = await BookingCancellationService.cancelBooking(
                bookingId,
                userId,
                reason,
                remarks || ""
            );

            return res.status(200).json({
                success: true,
                message: "Booking cancelled successfully.",
                refund: result.refund
            });
        } catch (error: any) {
            console.error("Cancellation execution error: ", error);
            return res.status(400).json({
                success: false,
                message: error.message || "An unexpected error occurred during cancellation."
            });
        }
    }
}

export default new BookingCancellationController();