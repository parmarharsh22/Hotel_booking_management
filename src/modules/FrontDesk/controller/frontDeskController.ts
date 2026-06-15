import { Request, Response } from "express";
import * as frontDeskServices from "../services/frontDeskServices";
import { getJwtTokenValue } from "../../../common/utils/getRequestVariables";
import { uploadToImageKit } from "../../../common/utils/uploadDocCloud";
import { getIo } from "../../../socket/socket";
import type { DashboardUpdatePayload, VerificationStatus, StoreDocBody, } from "../types/frontDesk.types";
import { RoomInventoryRow } from "../types/frontDesk.types";
export type FloorMap = Record<number, RoomInventoryRow[]>;

type BookingParams = {
    bookingRef: string;
};

// show dashboard homepage
export const showHomePage = async (req: Request, res: Response): Promise<void> => {
    try {
        const hotelId = getJwtTokenValue("hotel_id", req) as number;
        const userId = getJwtTokenValue("userId", req) as number;

        // cache hotel and user id in session
        (req.session as any).hotel_id = hotelId;
        (req.session as any).user_id = userId;

        // read and clear flash messages
        const failureMessage: string | undefined = (req.session as any).failureMessage;
        const success: string | undefined = (req.session as any).success;
        delete (req.session as any).failureMessage;
        delete (req.session as any).success;

        const shift = frontDeskServices.getCurrentShift();
        const dashboard = await frontDeskServices.getDashBoardData(hotelId, userId);

        res.render("frontDesk/home", {
            hotelId,
            hotelname: dashboard.userData.name,
            first_name: dashboard.userData.first_name,
            last_name: dashboard.userData.last_name,
            photo: dashboard.userData.photo_url,

            checkincount: dashboard.checkins,
            checkoutcount: dashboard.checkouts,
            occupancy: dashboard.occupancy,

            arrivals: dashboard.arrivals,

            counts: dashboard.counts,

            floorOccupancy: dashboard.floorOccupancy,

            roomTypeStats: dashboard.roomTypeStats,

            arrivalForecast: dashboard.arrivalForecast,

            error: failureMessage,
            success,
            shift
        });
    } catch (err: any) {

        console.error("[showHomePage]", err);
        (req.session as any).failureMessage = err.message;
        res.redirect("/frontDesk/logout");
    }
};

// render guest confirmation page
export const showGuestVerification = async (
    req: Request<BookingParams>,
    res: Response
): Promise<void> => {

    try {
        const bookingRef: string = req.params.bookingRef;
        const source = req.query.source || "current";
        const frontDeskId: number = (req.session as any).user_id;

        const data = await frontDeskServices.getBookingDetails(bookingRef);
        res.render("frontDesk/booking_details", {
            booking: data,
            user_id: frontDeskId,
            source
        });

    } catch (err: any) {

        console.error("[showGuestVerification]", err);
        (req.session as any).failureMessage = err.message;
        res.redirect("/frontDesk/home");
    }
};


// render identity capture page
export const showDocumentGathring = async (
    req: Request<BookingParams>,
    res: Response
): Promise<void> => {

    try {

        const bookingRef: string = req.params.bookingRef;
        const data = await frontDeskServices.getDocumentGatherData(bookingRef);

        res.render("frontDesk/capture_guest_identifications", {
            booking: data,
        });

    } catch (err: any) {

        console.error("[showDocumentGathring]", err);
        (req.session as any).failureMessage = err.message;
        res.redirect("/frontDesk/home");
    }
};


// upload document and update guest_identifications
export const storeDoc = async (
    req: Request<{ bookingRef: string }, {}, StoreDocBody>,
    res: Response
): Promise<void> => {

    try {
        const { booking_id, user_id, id_type_id, id_number, verification_status, remarks } = req.body;

        const hotelId: number = getJwtTokenValue("hotel_id", req) as number;
        const verifiedBy: number = getJwtTokenValue("userId", req) as number;

        // upload document if provided
        let documentUrl: string | null = null;
        if (req.file) {
            const uploaded: any = await uploadToImageKit(req.file);
            documentUrl = uploaded.url as string;
        }

        await frontDeskServices.insertIntoGuestIdent(
            booking_id,
            Number(user_id),
            verifiedBy,
            id_type_id,
            id_number,
            documentUrl,
            remarks,
            verification_status as VerificationStatus
        );

        // notify hotel staff via socket
        const io = getIo();
        const payload: DashboardUpdatePayload = {
            bookingId: booking_id,
            status: verification_status as VerificationStatus,
        };

        io.to(`hotel_${hotelId}`).emit("dashboardUpdate", payload);
        io.to(`hotel_${hotelId}`).emit("dashboard_update", payload);
        io.to(`hotel_${hotelId}`).emit("room_status_updated");


        // set flash success message
        (req.session as any).success = `${booking_id} checked IN`;
        res.redirect("/frontDesk/home");

    } catch (err: any) {

        console.error("[storeDoc]", err);
        (req.session as any).failureMessage = err.message;
        res.redirect("/frontDesk/home");
    }
};

// get and render the room_status page
export const showRoomStatus = async (
    req: Request,
    res: Response
): Promise<void> => {

    try {
        const hotelId = (req.session as any).hotel_id;

        const rooms: RoomInventoryRow[] = await frontDeskServices.getRoomStatuses(hotelId);
        const floors: FloorMap = rooms.reduce<FloorMap>((acc, room) => {
            if (!acc[room.floor]) {
                acc[room.floor] = [];
            }
            acc[room.floor].push(room);
            return acc;
        }, {});

        const occupiedCount: Number = rooms.filter(room => room.room_status === "OCCUPIED").length;
        const vacantCount: Number = rooms.filter(room => room.room_status === "VACANT").length;
        const maintenanceCount: Number = rooms.filter(room => room.room_status === "MAINTENANCE").length;
        console.log(rooms);
        res.render("frontDesk/room_statuses", {
            floors,
            rooms,
            occupiedCount,
            vacantCount,
            maintenanceCount,
            hotelId
        });
    } catch (err: any) {
        console.error("[show Room status]:", err);

        (req.session as any).failureMessage = err.message;
        res.redirect("/frontDesk/home");
    }
};

export const getBookingsOfHotel = async (req: Request, res: Response) => {
    try {

        const hotelId = (req.session as any).hotel_id;
        const page = Number(req.query.page) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;

        const search = req.query.search as string;
        const status = req.query.status as string;
        const dateFrom = req.query.from as string;
        const dateTo = req.query.to as string;

        const bookings = await frontDeskServices.getBookings({
            hotelId,
            search,
            status,
            dateFrom,
            dateTo,
            limit,
            offset
        });

        const totalRecords = await frontDeskServices.getBookingsCount({
            hotelId,
            search,
            status,
            dateFrom,
            dateTo,
            limit,
            offset
        });

        const totalPages = Math.ceil(totalRecords / limit);
        return res.render("frontDesk/whole_bookings", {
            bookings,
            currentPage: page,
            totalPages,
            totalRecords,
            search,
            statusFilter: status,
            dateFilter: { dateFrom, dateTo }
        });

    } catch (err) {
        console.error("Booking page error:", err);
        return res.status(500).send("Something went wrong");
    }
};


// logout 
export const logout = async (
    req: Request,
    res: Response
): Promise<void> => {

    try {

        res.clearCookie("token");
        delete (req.session as any).hotel_id;
        delete (req.session as any).user_id;
        res.redirect("/login");

    } catch (err: any) {

        console.error("[logout]", err);
        (req.session as any).failureMessage = err.message;
        res.redirect("/frontDesk/home");
    }
};