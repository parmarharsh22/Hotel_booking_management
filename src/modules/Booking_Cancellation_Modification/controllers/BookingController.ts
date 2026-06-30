import { Request, Response } from "express";
import BookingService from "../services/BookingService";

class BookingController {

    /*
    ============================================================
    RENDER EDIT BOOKING PAGE
    GET /bookings/:bookingId/edit
    ============================================================
    */

   async showEditBooking(req: Request, res: Response) {
    try {

        const bookingId = Number(req.params.bookingId);
        
      const userId = (req as any).user?.userId as number;
     
        

        const data = await BookingService.getBookingForEdit(
            bookingId,
            userId
        );

        console.log("called",data);

        return res.render(
            "myBookings/edit",
            {
                booking: data.booking,
                availableRooms: data.availableRooms
            }
        );   

    } catch (error: any) {

        return res.status(400).json({
            success: false,
            message: error.message
        });

    }
}

    /*
    ============================================================
    UPDATE BOOKING
    PUT /api/bookings/:bookingId
    ============================================================
    */

    async updateBooking(req: Request, res: Response) {

        try {

            const bookingId = Number(req.params.bookingId);

          const userId = (req as any).user?.userId as number;

            const result =
                await BookingService.modifyBooking(

                    bookingId,

                    userId,

                    req.body

                );

            return res.status(200).json(result);

        }

        catch (error: any) {

            return res.status(400).json({

                success: false,

                message: error.message

            });

        }

    }

}

export default new BookingController();