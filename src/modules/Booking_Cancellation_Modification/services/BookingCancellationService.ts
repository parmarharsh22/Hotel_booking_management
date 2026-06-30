import BookingCancellationModel from "../models/BookingCancellationModel";

class BookingCancellationService {

    static async getCancellationPreview(bookingId: number, userId: number) {
        const booking = await BookingCancellationModel.getBookingForCancellation(bookingId, userId);

        if (!booking) {
            throw new Error("Booking not found.");
        }

        const normalizedStatus = booking.status_name.toUpperCase();
        if (normalizedStatus === "CANCELLED") {
            throw new Error("Booking has already been cancelled.");
        }
        if (normalizedStatus === "CHECKED_IN") {
            throw new Error("Checked-in bookings cannot be cancelled.");
        }
        if (normalizedStatus === "CHECKED_OUT") {
            throw new Error("Checked-out bookings cannot be cancelled.");
        }

        const policy = await BookingCancellationModel.getCancellationPolicy(booking.hotel_id, booking.room_type_id);
        if (!policy) {
            throw new Error("Cancellation policy not found for this property.");
        }

        const refund = this.calculateRefund(
            booking.total_amount,
            booking.checkin_date,
            policy.free_cancellation_hours,
            policy.refund_percentage
        );

        return { booking, policy, refund };
    }

    static async cancelBooking(bookingId: number, userId: number, reason: string, remarks: string) {
        const booking = await BookingCancellationModel.getBookingForCancellation(bookingId, userId);

        if (!booking) {
            throw new Error("Booking not found.");
        }

        const normalizedStatus = booking.status_name.toUpperCase();
        if (normalizedStatus === "CANCELLED") {
            throw new Error("Booking has already been cancelled.");
        }
        if (normalizedStatus === "CHECKED_IN") {
            throw new Error("Checked-in bookings cannot be cancelled.");
        }
        if (normalizedStatus === "CHECKED_OUT") {
            throw new Error("Checked-out bookings cannot be cancelled.");
        }

        const policy = await BookingCancellationModel.getCancellationPolicy(booking.hotel_id, booking.room_type_id);
        if (!policy) {
            throw new Error("Cancellation policy not found.");
        }

        const refund = this.calculateRefund(
            booking.total_amount,
            booking.checkin_date,
            policy.free_cancellation_hours,
            policy.refund_percentage
        );

        const connection = await BookingCancellationModel.getConnection();

        try {
            await connection.beginTransaction();

            await BookingCancellationModel.insertCancellationHistory(connection, {
                bookingId,
                cancelledBy: userId,
                reason,
                remarks,
                refundPercentage: refund.refundPercentage,
                refundAmount: refund.refundAmount,
                cancellationCharge: refund.cancellationCharge
            });

            // 5 = CANCELLED Status ID
           // ... existing transaction logic inside cancelBooking() ...

/**
 * Booking Status
 * CANCELLED = 5
 */
await BookingCancellationModel.updateBookingStatus(
    connection,
    bookingId,
    5
);

/**
 * Payment Status Mapping based on your updated table:
 * 5 = REFUNDED
 * 6 = PARTIALLY_REFUNDED
 */
if (booking.payment_id) {
    let paymentStatus = 6; // Default to PARTIALLY_REFUNDED

    // If the calculation returned a full refund amount, give it status 5
    if (refund.refundAmount >= booking.total_amount) {
        paymentStatus = 5; // REFUNDED
    }

    await BookingCancellationModel.updatePaymentRefund(
        connection,
        booking.payment_id,
        paymentStatus
    );
}

await BookingCancellationModel.releaseBookedRooms(
    connection,
    bookingId
);
            await connection.commit();
            return { success: true, refund };

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    private static calculateRefund(
        totalAmount: number,
        checkinDate: Date,
        freeCancellationHours: number,
        refundPercentage: number
    ) {
        const now = new Date();
        const checkin = new Date(checkinDate);
        const diffHours = (checkin.getTime() - now.getTime()) / (1000 * 60 * 60);

        let actualRefundPercentage = 0;
        if (diffHours >= freeCancellationHours) {
            actualRefundPercentage = 100;
        } else {
            actualRefundPercentage = refundPercentage;
        }

        const refundAmount = Number((totalAmount * actualRefundPercentage / 100).toFixed(2));
        const cancellationCharge = Number((totalAmount - refundAmount).toFixed(2));

        return {
            hoursRemaining: Math.floor(diffHours),
            refundPercentage: actualRefundPercentage,
            refundAmount,
            cancellationCharge
        };
    }
}

export default BookingCancellationService;