import { Request, Response } from "express";
import * as frontDeskServices from "../services/frontDeskServices";
import { getJwtTokenValue } from "../../../common/utils/getRequestVariables";
import { uploadToImageKit } from "../../../common/utils/uploadDocCloud";
import { getIo } from "../../../socket/socket";
// show dashboard homepage
export const showHomePage = async (
    req: Request,
    res: Response
) => {

    try {

        const hotelId = getJwtTokenValue("hotel_id", req);
        const userId = getJwtTokenValue("userId", req);

        // store values in session
        (req.session as any).hotel_id = hotelId;
        (req.session as any).user_id = userId;

        // get flash message
        const failureMessage = (req.session as any).failureMessage;
        delete (req.session as any).failureMessage;

        // get current shift
        const shift: string = frontDeskServices.getCurrentShift();

        // get dashboard data
        const dashboardData =
            await frontDeskServices.getDashBoardData(
                hotelId,
                userId
            );

        res.render("frontDesk/home", {

            hotelId,

            hotelname:
                dashboardData.userData.name,

            first_name:
                dashboardData.userData.first_name,

            last_name:
                dashboardData.userData.last_name,

            photo:
                dashboardData.userData.photo_url,

            checkincount:
                dashboardData.checkins,

            checkoutcount:
                dashboardData.checkouts,

            occupancy:
                dashboardData.occupancy,

            arrivals:
                dashboardData.arrivals,

            error: failureMessage,
            shift
        });

    } catch (err: any) {

        console.error(err);

        (req.session as any).failureMessage =
            err.message;

        res.redirect("/frontDesk/logout");
    }
};

//render the verificationPage
export const showGuestVerification = async (req: Request, res: Response) => {
    try {
        // get the bookingRef number
        const bookingRef: string = req.params.bookingRef.toString();
        const frontDeskId = (req.session as any).user_id;
        const data = await frontDeskServices.getBookingDetails(bookingRef)
        res.render("frontDesk/booking_details", { booking: data, user_id: frontDeskId });
    } catch (err: any) {
        (req.session as any).failureMessage = err.message;
        res.redirect("/login");
    }
}

//render the document Capturing phase
export const showDocumentGathring = async (req: Request, res: Response) => {
    try {
        const booking_ref: string = req.params.bookingRef.toString();
        const staff_id = (req.session as any).user_id;
        const data = await frontDeskServices.getDocumentGatherData(booking_ref);
        return res.render("frontDesk/capture_guest_identifications", { booking: data });
    } catch (err: any) {
        console.log(err);
    }
}

//store the documents in the cloud + db

export const storeDoc = async (
    req: Request,
    res: Response
) => {

    try {

        const {
            booking_id,
            user_id,
            id_type_id,
            id_number,
            verification_status,
            remarks
        } = req.body;

        const hotelId =
            getJwtTokenValue("hotel_id", req);

        const verifiedBy =
            getJwtTokenValue("userId", req);

        let documentUrl: string | null = null;

        if (req.file) {

            const uploaded: any =
                await uploadToImageKit(req.file);

            documentUrl = uploaded.url;
        }

        await frontDeskServices.insertIntoGuestIdent(
            booking_id,
            user_id,
            verifiedBy,
            id_type_id,
            id_number,
            documentUrl,
            remarks,
            verification_status
        );

        const io = getIo();

        io.to(`hotel_${hotelId}`).emit(
            "dashboard_update",
            {
                bookingId: booking_id,
                status: verification_status
            }
        );

        return res.redirect(
            "/frontDesk/home"
        );

    } catch (err) {

        console.log(err);

        return res.redirect(
            "/frontDesk/home"
        );
    }
};

// logout front desk user
export const logout = async (
    req: Request,
    res: Response
) => {

    try {

        // clear jwt cookie
        res.clearCookie("token");

        // clear session values
        delete (req.session as any).hotel_id;
        delete (req.session as any).user_id;

        res.redirect("/login");

    } catch (err: any) {

        (req.session as any).failureMessage = err.message;

        res.redirect("/frontDesk/home");
    }
};