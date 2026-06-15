import * as frontDeskModel from "../models/frondDeskModel";
import type { DashboardData, Shift, BookingDetailRow, VerificationPageRow, VerificationStatus } from "../types/frontDesk.types";
import type { RoomInventoryRow,BookingFilters } from "../types/frontDesk.types";

// dashboard data via parallel queries
export const getDashBoardData = async (
    hotelId: number,
    userId: number
): Promise<DashboardData> => {

    const [
        userData,
        checkins,
        checkouts,
        occupancy,
        arrivals,
        counts,
        floorOccupancy,
        roomTypeStats,
        arrivalForecast
    ] = await Promise.all([
        frontDeskModel.frontDeskData(userId),
        frontDeskModel.getCheckinCount(hotelId),
        frontDeskModel.getCheckoutCount(hotelId),
        frontDeskModel.getOccupancy(hotelId),
        frontDeskModel.getUpcomingArrivals(hotelId),

        frontDeskModel.getAllCounts(hotelId),
        frontDeskModel.getFloorOccupancy(hotelId),
        frontDeskModel.getRoomTypeUtilization(hotelId),
        frontDeskModel.getArrivalForecast(hotelId),
    ]);

    if (!userData) {
        throw new Error(
            "Error fetching dashboard data — user not found."
        );
    }

    return {
        userData,
        checkins,
        checkouts,
        occupancy,
        arrivals,
        counts,
        floorOccupancy,
        roomTypeStats,
        arrivalForecast,
    };
};


// current shift
export const getCurrentShift = (): Shift => {

    const hour = new Date().getHours();

    if (hour >= 6 && hour < 14) return "Morning";
    if (hour >= 14 && hour < 22) return "Evening";
    return "Night";
};


// booking details for confirmation screen
export const getBookingDetails = async (
    bookingRef: string
): Promise<BookingDetailRow> => {

    const data = await frontDeskModel.getBookingDetails(bookingRef);

    if (!data) {
        throw new Error(`No booking found for reference "${bookingRef}".`);
    }

    return data;
};


// minimal data for document gathering screen
export const getDocumentGatherData = async (
    bookingRef: string
): Promise<VerificationPageRow> => {
    const data = await frontDeskModel.getVerificationPageData(bookingRef);
    if (!data) {
        throw new Error(`No booking found for reference "${bookingRef}".`);
    }
    return data;
};


// save id document and update booking status
export const insertIntoGuestIdent = async (
    booking_id: string,
    user_id: number,
    staff_id: number,
    id_type_id: string,
    id_number: string,
    documentUrl: string | null,
    remarks: string,
    verification_status: VerificationStatus
): Promise<void> => {

    await Promise.all([
        frontDeskModel.insertIntoGuestIdentifier(
            booking_id,
            user_id,
            staff_id,
            id_type_id,
            id_number,
            documentUrl,
            verification_status,
            remarks
        ),
        frontDeskModel.updateRoomState(verification_status, booking_id),
    ]);
};

// room inventory for the room status page
export const getRoomStatuses = async (
    hotelId: number
): Promise<RoomInventoryRow[]> => {

    return await frontDeskModel.getRoomStatuses(
        hotelId
    );
};

// Get all the hotel Bookings 
export const getBookings = async (filters: BookingFilters) => {

    const params: any[] = [filters.hotelId];

    let sql = `
        SELECT b.booking_id,b.booking_reference,u.first_name,u.last_name,
            GROUP_CONCAT(DISTINCT r.room_number ORDER BY r.room_number SEPARATOR ', ') AS room_numbers,
            GROUP_CONCAT(DISTINCT rt.type_name ORDER BY rt.type_name SEPARATOR ', ') AS room_types,
            bs.status_name AS booking_status,
            b.checkin_date,
            b.checkout_date,
            b.total_amount,
            b.created_at
        FROM bookings b
        JOIN users u 
            ON u.user_id = b.user_id
        JOIN booking_statuses bs 
            ON bs.booking_status_id = b.booking_status_id
        LEFT JOIN booking_rooms br 
            ON br.booking_id = b.booking_id
        LEFT JOIN rooms r 
            ON r.room_id = br.room_id
        LEFT JOIN room_types rt 
            ON rt.room_type_id = r.room_type_id
        WHERE b.hotel_id = ?`;

    //  SEARCH
    if (filters.search) {
        sql += `
            AND (
                b.booking_reference LIKE ?
                OR u.first_name LIKE ?
                OR u.last_name LIKE ?
            )
        `;
        const s = `%${filters.search}%`;
        params.push(s, s, s);
    }

    //  STATUS FILTER
    if (filters.status) {
        sql += ` AND bs.status_name = ?`;
        params.push(filters.status);
    }

    //  DATE FILTER
    if (filters.dateFrom) {
        sql += ` AND b.checkin_date >= ?`;
        params.push(filters.dateFrom);
    }

    if (filters.dateTo) {
        sql += ` AND b.checkout_date <= ?`;
        params.push(filters.dateTo);
    }

    sql += `
        GROUP BY b.booking_id
        ORDER BY b.created_at DESC
        LIMIT ? OFFSET ?
    `;

    params.push(filters.limit, filters.offset);

    return await frontDeskModel.fetchBookings(sql, params);
};

//prime Pagination task
export const getBookingsCount = async (filters: BookingFilters) => {
    const params: any[] = [filters.hotelId];
    let sql = `
        SELECT COUNT(DISTINCT b.booking_id) AS total
        FROM bookings b
        JOIN users u 
            ON u.user_id = b.user_id
        JOIN booking_statuses bs 
            ON bs.booking_status_id = b.booking_status_id
        WHERE b.hotel_id = ?`;
    if (filters.search) {
        sql += `
            AND (
                b.booking_reference LIKE ?
                OR u.first_name LIKE ?
                OR u.last_name LIKE ?
            )
        `;
        const s = `%${filters.search}%`;
        params.push(s, s, s);
    }
    if (filters.status) {
        sql += ` AND bs.status_name = ?`;
        params.push(filters.status);
    }
    const result = await frontDeskModel.fetchBookingsCount(sql, params);
    return result;
};