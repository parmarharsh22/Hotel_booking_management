import { Request, Response } from "express";
import * as frontDeskServices from "../services/frontDeskServices";
import { getJwtTokenValue } from "../../../common/utils/getRequestVariables";
import { uploadToImageKit } from "../../../common/utils/uploadDocCloud";
import { emitDashboardUpdate, emitRoomStatusUpdate } from "../../../socket/frontDesk/homePage";
import type { VerificationStatus, StoreDocBody, } from "../types/frontDesk.types";
import * as frontDeskModel from "../models/frondDeskModel";
import { RoomInventoryRow } from "../types/frontDesk.types";

export type FloorMap = Record<number, RoomInventoryRow[]>;

type BookingParams = {
    bookingRef: string;
};

type incidentalParams = {
    bookingId: string;
}

type delincidentalParams = {
    incidentalid: string
}

// show dashboard homepage
export const showHomePage = async (
    req: Request,
    res: Response
): Promise<void> => {
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
            success: success,
            shift,
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
            source,
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
        const {
            booking_id,
            user_id,
            id_type_id,
            id_number,
            verification_status,
            remarks,
        } = req.body;

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

        // tell all clients in this hotel which booking just changed and its result
        emitDashboardUpdate(hotelId, booking_id, verification_status as VerificationStatus);

        // also refresh room status since checkin changes a room's occupancy
        emitRoomStatusUpdate(hotelId);

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
        const hotelId: number = getJwtTokenValue("hotel_id", req) as number;
        const rooms: RoomInventoryRow[] = await frontDeskServices.getRoomStatuses(hotelId);

        const floors: FloorMap = rooms.reduce<FloorMap>((acc, room) => {
            if (!acc[room.floor]) acc[room.floor] = [];
            acc[room.floor].push(room);
            return acc;
        }, {});

        const occupiedCount = rooms.filter(r => r.room_status === "OCCUPIED").length;
        const vacantCount = rooms.filter(r => r.room_status === "VACANT").length;
        const maintenanceCount = rooms.filter(r => r.room_status === "MAINTENANCE").length;

        res.render("frontDesk/room_statuses", {
            floors,
            rooms,
            occupiedCount,
            vacantCount,
            maintenanceCount,
            hotelId,
        });
    } catch (err: any) {
        console.error("[showRoomStatus]:", err);
        (req.session as any).failureMessage = err.message;
        res.redirect("/frontDesk/home");
    }
};

// get and render all bookings with filters + pagination
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

        const filters = { hotelId, search, status, dateFrom, dateTo, limit, offset };

        const [bookings, totalRecords] = await Promise.all([
            frontDeskServices.getBookings(filters),
            frontDeskServices.getBookingsCount(filters),
        ]);

        const totalPages = Math.ceil(totalRecords / limit);

        return res.render("frontDesk/whole_bookings", {
            bookings,
            currentPage: page,
            totalPages,
            totalRecords,
            search,
            statusFilter: status,
            dateFilter: { dateFrom, dateTo },
        });
    } catch (err) {
        console.error("[getBookingsOfHotel]:", err);
        return res.status(500).send("something went wrong");
    }
};

// render all the guests that are currently checked in
export const getAllCheckInGuests = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const hotelid: number = getJwtTokenValue("hotel_id", req) as number;
        const checkedInGuests = await frontDeskServices.getAllCheckIn(hotelid);
        res.render("frontDesk/checkout.ejs", { checkedInGuests });
    } catch (err: any) {
        console.error("[getAllCheckInGuests]:", err);
        (req.session as any).failureMessage = err.message;
        res.redirect("/frontDesk/home");
    }
};

// redirect to bill view for a checked-in guest before actual checkout
export const checkOutUser = async (
    req: Request<BookingParams>,
    res: Response
): Promise<void> => {
    try {
        const bookId: string = req.params.bookingRef;
        res.redirect(`/frontDesk/checkIn/${bookId}?source=bill`);
    } catch (err: any) {
        console.error("[checkOutUser]", err);
        res.redirect("/frontDesk/home");
    }
};

// release the booked rooms — occupied -> dirty (db) + 15-min redis key per room
// the dirtyRoomWorker polls every 2 min and flips rooms to available once the key expires
export const releaseRoom = async (req: Request, res: Response) => {
    try {
        const hotelId = getJwtTokenValue("hotel_id", req) as number;
        const { bookingReference } = req.body;
        if (!bookingReference) {
            return res.status(500).send("Undefined Booking Ref");
        }
        // transaction: mark booking checked_out + mark rooms dirty in db
        const rooms = await frontDeskServices.checkoutGuest(bookingReference, hotelId);

        await frontDeskServices.scheduleDirtyRoomCleanup(hotelId, rooms);

        emitRoomStatusUpdate(hotelId);

        return res.json({ success: true, rooms });
    } catch (err: any) {
        console.error("[releaseRoom]:", err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

// staff-triggered early clean — skips the 15-min wait
// deletes the redis key so the worker ignores the room, then flips to available in db
//also append the invoice entry
export const cleanRoom = async (req: Request, res: Response) => {
    try {
        const hotelId = getJwtTokenValue("hotel_id", req) as number;
        const roomId = Number(req.body.roomId);

        if (!roomId) {
            return res.status(400).json({ success: false, message: "roomId is required" });
        }

        await frontDeskServices.markRoomClean(hotelId, roomId);

        emitRoomStatusUpdate(hotelId);

        return res.json({ success: true });
    } catch (err: any) {
        console.error("[cleanRoom]:", err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

//show the eligibleGuests for incidentals
export const showIncidentals = async (req: Request, res: Response) => {
    try {
        const hotelId = getJwtTokenValue("hotel_id", req) as number;
        const eligibleBookings = await frontDeskServices.getEligbleGuests(hotelId)
        res.render("frontDesk/eligible_for_incidentials", { eligibleBookings, hotelId });
    } catch (err: any) {
        console.log("Error at [showIncidentials]", err);
    }
}

//show the existing incidentals and also add new ones
export const manageIncidentals = async (
    req: Request<incidentalParams>,
    res: Response
) => {
    try {

        const bookingId = parseInt(req.params.bookingId);
        const hotelId = getJwtTokenValue("hotel_id", req) as number;

        const booking = await frontDeskModel.getBookingDetailsForIncidental(hotelId, bookingId);

        const incidentals = await frontDeskServices.manageIncidentals(hotelId, bookingId);

        //flash message
        const success: string = (req.session as any).success
        const failure: string = (req.session as any).failureMessage

        delete (req.session as any).success;
        delete (req.session as any).failureMessage;

        const totalIncidentals = incidentals.reduce(
            (sum, item) =>
                sum +
                Number(item.amount),
            0
        );

        res.render("frontDesk/manageIncidential",
            {
                booking, incidentals, totalIncidentals, success, failure
            }
        );

    } catch (err: any) {
        console.log("[manageIncidentals]", err);
    }
}

//add a incidental
export const addIncidental = async (req: Request, res: Response): Promise<void> => {
    try {
        const hotelId = getJwtTokenValue("hotel_id", req) as number;
        const userId = getJwtTokenValue("userId", req) as number;
        const { bookingId, description, amount } = req.body;
        await frontDeskModel.addIncidental(hotelId, bookingId, userId, description, amount);
        (req.session as any).success = `Incidental added to bookingId ${bookingId}`
        return res.redirect(`/frontDesk/showIncidental/${bookingId}`);

    } catch (err: any) {
        (req.session as any).failure = `Incidental can't be added `
        console.log("Error at [addIncidental]", err);
        return res.redirect(`/frontDesk/showIncidental/${req.body.bookingId}`);
    }
}

export const removeIncidental = async (req: Request<delincidentalParams>, res: Response): Promise<void> => {
    try {
        const hotelId = getJwtTokenValue("hotel_id", req) as number;
        const incidentalId = parseInt(req.params.incidentalid);
        const bookingId = Number(req.body.bookId);

        await frontDeskModel.deleteIncidental(hotelId, incidentalId);

        (req.session as any).success = `Incidental deleted from booking ${bookingId}`;

        return res.redirect(`/frontDesk/showIncidental/${bookingId}`);

    } catch (err) {
        console.log("Error at [removeIncidental]", err);

        (req.session as any).failure =
            "Incidental can't be deleted";

        return res.redirect("/frontDesk/showBookings");
    }
};

// show the payements table
export const getPayments = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const hotelId = getJwtTokenValue("hotel_id", req) as number;
        const payments = await frontDeskServices.getPayments(hotelId);
        res.render("frontDesk/payments", { payments });

    } catch (err) {
        console.log("Error at [getPayements]", err);
        (req.session as any).failure = "Payements can't be fetched";
        return res.redirect("/frontDesk/home");
    }
};

// show the invoices from the db
export const getInvoices = async (req: Request, res: Response): Promise<void> => {
    try {
        const hotelId = getJwtTokenValue("hotel_id", req) as number;
        const invoices = await frontDeskServices.getInvoices(hotelId);
        res.render("frontDesk/invoices", { invoices }
        );
    } catch (err) {
        console.log("Error at [getInvoices]", err);
        (req.session as any).failure = "Invoices can't be fetched";
        return res.redirect("/frontDesk/home");
    }
};

// logout
export const logout = async (req: Request, res: Response): Promise<void> => {
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