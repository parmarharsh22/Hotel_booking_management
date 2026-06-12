import { emitDashboardUpdate } from "../../../socket/frontDesk/homePage";
import * as frontDeskModel from "../models/frondDeskModel";


// get dashboard data
export const getDashBoardData = async (
    hotelId: number,
    userId: number
) => {

    const [
        userData,
        checkins,
        checkouts,
        occupancy,
        arrivals
    ] = await Promise.all([
        frontDeskModel.frontDeskData(userId),
        frontDeskModel.getCheckinCount(hotelId),
        frontDeskModel.getCheckoutCount(hotelId),
        frontDeskModel.getOccupancy(hotelId),
        frontDeskModel.getUpcomingArrivals(hotelId)
    ]);

    if (!userData) {
        throw new Error("error fetching dashboard data");
    }

    return {
        userData,
        checkins,
        checkouts,
        occupancy,
        arrivals
    };
};

// get current shift
export const getCurrentShift = (): string => {

    const currentHour = new Date().getHours();

    if (currentHour >= 6 && currentHour < 14) {
        return "Morning";
    }

    if (currentHour >= 14 && currentHour < 22) {
        return "Evening";
    }

    return "Night";
};

//get current user and hotel data
export const getBookingDetails = async (book_id: string) => {
    const data = await frontDeskModel.getBookingDetails(book_id);
    if (!data) {
        throw new Error("Invalid data!");
    }
    return data;
};

//get the documentData
export const getDocumentGatherData = async (bookin_ref: string) => {
    const data = await frontDeskModel.getVerificationPageData(bookin_ref);
    if (!data) { throw new Error("No such data") };
    return data;
}

// insert the document and upadte the guest_ident table
export const insertIntoGuestIdent = async (
    booking_id: string,
    user_id: number,
    id_type_id: number,
    id_number: string,
    verification_status: string,
    documentUrl: string | null,
    remarks: string,
    staff_id: number
) => {
    await frontDeskModel.insertIntoGuestIdentifier(booking_id, user_id, id_type_id, id_number, verification_status, documentUrl, remarks, staff_id);
    await frontDeskModel.updateRoomState(verification_status, booking_id);
}