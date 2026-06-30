import BookingModel from "../models/BookingModel";

export default class BookingService {

    /*
    ==================================================
    MODIFY BOOKING
    ==================================================
    */

    static async modifyBooking(

        bookingId: number,

        userId: number,

        payload: any

    ) {

        const booking = await BookingModel.getBookingForModification(
            bookingId,
            userId
        );



        /*
        ===============================================
        BOOKING EXISTS?
        ===============================================
        */

        if (!booking) {
            throw new Error("Booking not found.");
        }

        /*
        ===============================================
        ONLY CONFIRMED BOOKINGS
        ===============================================
        */

        if (booking.booking_status_id !== 2) {
            throw new Error(
                "Only confirmed bookings can be modified."
            );
        }

        /*
        ===============================================
        VALIDATE DATES
        ===============================================
        */

        const checkin = new Date(payload.checkin_date);
        const checkout = new Date(payload.checkout_date);

        if (checkin >= checkout) {
            throw new Error(
                "Checkout date must be after check-in date."
            );
        }

        /*
        ===============================================
        MODIFICATION DEADLINE
        ===============================================
        */

        const hoursBeforeCheckin =
            (new Date(booking.checkin_date).getTime() - Date.now())
            / (1000 * 60 * 60);

        const policy =
            await BookingModel.getCancellationPolicy(
                booking.hotel_id,
                booking.room_type_id
            );

        const allowedHours =
            policy?.free_cancellation_hours ?? 24;

        if (hoursBeforeCheckin > allowedHours) {

            throw new Error(

                `Booking cannot be modified within ${allowedHours} hours of check-in.`

            );

        }

        /*
        ===============================================
        ROOM AVAILABILITY
        ===============================================
        */

        const roomAvailable =
            await BookingModel.checkRoomAvailability(

                payload.room_id,

                payload.checkin_date,

                payload.checkout_date,

                bookingId

            );

        if (!roomAvailable) {

            throw new Error(

                "Selected room is not available."

            );

        }

        /*
        ===============================================
        START TRANSACTION
        ===============================================
        */

        const connection =
            await BookingModel.getConnection();

        try {

            await connection.beginTransaction();

            /*
            ===========================================
            UPDATE BOOKING
            ===========================================
            */

            await BookingModel.updateBooking(

                connection,

                bookingId,

                payload

            );

            /*
            ===========================================
            UPDATE ROOM
            ===========================================
            */

            if (booking.room_id != payload.room_id) {

                await BookingModel.updateBookingRoom(

                    connection,

                    bookingId,

                    payload.room_id

                );

            }

            /*
            ===========================================
            HISTORY
            ===========================================
            */

            await BookingModel.insertModificationHistory(

                connection,

                {

                    booking_id: booking.booking_id,

                    modified_by: userId,

                    old_checkin_date: booking.checkin_date,

                    new_checkin_date: payload.checkin_date,

                    old_checkout_date: booking.checkout_date,

                    new_checkout_date: payload.checkout_date,

                    old_adults: booking.adults,

                    new_adults: payload.adults,

                    old_children: booking.children,

                    new_children: payload.children,

                    old_room_id: booking.room_id,

                    new_room_id: payload.room_id

                }

            );

            /*
            ===========================================
            COMMIT
            ===========================================
            */

            await connection.commit();

            return {

                success: true,

                message: "Booking updated successfully."

            };

        }

        catch (error) {

            await connection.rollback();

            throw error;

        }

        finally {

            connection.release();

        }

    }

/*
==================================================
GET BOOKING FOR EDIT PAGE
==================================================
*/

static async getBookingForEdit(

    
    bookingId: number,
    
    userId: number
    
) {

    const booking =
        await BookingModel.getBookingForModification(

            bookingId,

            userId

        );

    if (!booking) {

        throw new Error(

            "Booking not found."

        );

    }

    const rooms =
        await BookingModel.getAvailableRooms(

            booking.hotel_id,

            booking.room_type_id,

            booking.checkin_date,

            booking.checkout_date,

            booking.booking_id

        );

    return {

        booking,

        availableRooms: rooms

    };

}


}