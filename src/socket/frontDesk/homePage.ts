import { getIo } from "../socket";

// emit a targeted event telling all front desk clients in a hotel to refresh
// their room status widget — no data is sent, the client fetches fresh data itself
// this avoids hardcoding any user_id here and keeps the socket layer stateless
export const emitRoomStatusUpdate = (hotelId: number): void => {
    const io = getIo();
    io.to(`hotel_${hotelId}`).emit("room_status_updated");
};

// emit after a checkin verification completes — tells clients which booking changed
// and whether it was approved or failed so the arrivals list can update
export const emitDashboardUpdate = (
    hotelId: number,
    bookingId: string | number,
    status: "APPROVED" | "FAILED"
): void => {
    const io = getIo();
    io.to(`hotel_${hotelId}`).emit("dashboardUpdate", { bookingId, status });
};