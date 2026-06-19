import * as frontDeskModel from "../models/frondDeskModel";
import { db } from "../../../config/db";
import { redis } from "../../../config/redis";
import type { DashboardData, Shift, BookingDetailRow, VerificationPageRow, VerificationStatus, CheckedOutRoom, renderIncidentals, Incidental, } from "../types/frontDesk.types";
import type { RoomInventoryRow, BookingFilters, getAllCheckInGuest, } from "../types/frontDesk.types";

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
        arrivalForecast,
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
        throw new Error("error fetching dashboard data — user not found.");
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

// current shift based on hour
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
        throw new Error(`no booking found for reference "${bookingRef}".`);
    }

    return data;
};

// minimal data for document gathering screen
export const getDocumentGatherData = async (
    bookingRef: string
): Promise<VerificationPageRow> => {
    const data = await frontDeskModel.getVerificationPageData(bookingRef);

    if (!data) {
        throw new Error(`no booking found for reference "${bookingRef}".`);
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
    if (verification_status === "APPROVED") {
        await frontDeskModel.markRoomsOccupied(booking_id);
    }
};

// room inventory for the room status page
export const getRoomStatuses = async (
    hotelId: number
): Promise<RoomInventoryRow[]> => {
    return await frontDeskModel.getRoomStatuses(hotelId);
};

// get all the hotel bookings with optional filters
export const getBookings = async (filters: BookingFilters) => {
    const params: any[] = [filters.hotelId];

    let sql = `
        SELECT
            b.booking_id, b.booking_reference,
            u.first_name, u.last_name,
            GROUP_CONCAT(DISTINCT r.room_number  ORDER BY r.room_number  SEPARATOR ', ') AS room_numbers,
            GROUP_CONCAT(DISTINCT rt.type_name   ORDER BY rt.type_name   SEPARATOR ', ') AS room_types,
            bs.status_name AS booking_status,
            b.checkin_date,
            b.checkout_date,
            b.total_amount,
            b.created_at
        FROM bookings b
        JOIN users u             ON u.user_id             = b.user_id
        JOIN booking_statuses bs ON bs.booking_status_id  = b.booking_status_id
        LEFT JOIN booking_rooms br ON br.booking_id       = b.booking_id
        LEFT JOIN rooms r          ON r.room_id           = br.room_id
        LEFT JOIN room_types rt    ON rt.room_type_id     = r.room_type_id
        WHERE b.hotel_id = ?`;

    // search filter
    if (filters.search) {
        sql += `
            AND (
                b.booking_reference LIKE ?
                OR u.first_name LIKE ?
                OR u.last_name  LIKE ?
            )
        `;
        const s = `%${filters.search}%`;
        params.push(s, s, s);
    }

    // status filter
    if (filters.status) {
        sql += ` AND bs.status_name = ?`;
        params.push(filters.status);
    }

    // date filters
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

// pagination task — total booking count with same filters
export const getBookingsCount = async (filters: BookingFilters) => {
    const params: any[] = [filters.hotelId];

    let sql = `
        SELECT COUNT(DISTINCT b.booking_id) AS total
        FROM bookings b
        JOIN users u             ON u.user_id             = b.user_id
        JOIN booking_statuses bs ON bs.booking_status_id  = b.booking_status_id
        WHERE b.hotel_id = ?`;

    if (filters.search) {
        sql += `
            AND (
                b.booking_reference LIKE ?
                OR u.first_name LIKE ?
                OR u.last_name  LIKE ?
            )
        `;
        const s = `%${filters.search}%`;
        params.push(s, s, s);
    }

    if (filters.status) {
        sql += ` AND bs.status_name = ?`;
        params.push(filters.status);
    }

    return await frontDeskModel.fetchBookingsCount(sql, params);
};

// get all the checked-in guest list
export const getAllCheckIn = async (
    hotelId: number
): Promise<getAllCheckInGuest[]> => {
    const result: getAllCheckInGuest[] =
        await frontDeskModel.getAllCheckInGuests(hotelId);
    return result;
};

// checkout guest — marks booking checked_out, marks rooms dirty in db
// returns the list of dirty rooms so the caller can set redis keys
export const checkoutGuest = async (
    bookingReference: string,
    hotelId: number
): Promise<CheckedOutRoom[]> => {
    const conn = await db.getConnection();

    try {
        await conn.beginTransaction();

        await frontDeskModel.markBookingAsCheckedOut(
            conn,
            bookingReference,
            hotelId
        );

        const rooms = await frontDeskModel.getBookingRooms(
            conn,
            bookingReference,
            hotelId
        );

        await frontDeskModel.markRoomsDirty(conn, bookingReference, hotelId);

        await conn.commit();

        return rooms;
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
};

// redis is generated for the dirty room keyvalue: pair
export const dirtyRoomKey = (hotelId: number, roomId: number): string => {
    return `dirty_room_${hotelId}_${roomId}`;
};

// when the key is alive the room is still in the dirty window
export const scheduleDirtyRoomCleanup = async (
    hotelId: number,
    rooms: CheckedOutRoom[]
): Promise<void> => {
    //15 min hold for cleanning purpose
    const DIRTY_TTL_SECONDS = 900;
    for (const room of rooms) {
        const key = dirtyRoomKey(hotelId, room.room_id);
        await redis.setex(key, DIRTY_TTL_SECONDS, "DIRTY");
    }
};

// check if a room is still within its 15-min dirty window
export const isRoomDirty = async (
    hotelId: number,
    roomId: number
): Promise<boolean> => {
    console.log("CHECK OCCURED")
    const key = dirtyRoomKey(hotelId, roomId);
    const value = await redis.get(key);
    return value === "DIRTY";
};

// staff-triggered early clean — deletes redis key + flips to available in db immediately
// del before db update so no window where key is gone but db still shows dirty
export const markRoomClean = async (
    hotelId: number,
    roomId: number
): Promise<void> => {
    const key = dirtyRoomKey(hotelId, roomId);
    await redis.del(key);
    await frontDeskModel.markRoomAvailable(roomId);
};

// db-only flip to available — used by the worker when the redis key has already expired
export const markRoomAvailableInDb = async (roomId: number): Promise<void> => {
    await frontDeskModel.markRoomAvailable(roomId);
};

// fetch all rooms currently marked dirty in db
// used by the worker to know what to check against redis
export const getAllDirtyRooms = async (): Promise<{ room_id: number; hotel_id: number }[]> => {
    return await frontDeskModel.getAllDirtyRooms();
};

//get the all the eligibleGuest from the db
export const getEligbleGuests = async (hotelId:number):Promise<renderIncidentals[]> => {
    const eligibleGuests:renderIncidentals[] = await frontDeskModel.renderIncidential(hotelId);
    return eligibleGuests
}

export const manageIncidentals = async (hotelId:number,bookingId:number):Promise<Incidental[]> => {
    const guestDetails:Incidental[] = await frontDeskModel.getBookingIncidentals(hotelId,bookingId);
    return guestDetails
} 