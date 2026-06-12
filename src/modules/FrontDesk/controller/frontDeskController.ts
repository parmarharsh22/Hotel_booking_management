import { Request, Response } from "express";
import * as frontDeskServices from "../services/frontDeskServices";
import { getJwtTokenValue } from "../../../common/utils/getRequestVariables";
import { error } from "node:console";

//show homepage
export const showHomePage = async (req: Request, res: Response) => {
    try {
        const hotelid = getJwtTokenValue("hotel_id", req);
        const user_id = getJwtTokenValue("userId", req);

        //set the hotel_Id and user_id so to avoid calling the same again and again
        (req.session as any).hotel_id = hotelid;
        (req.session as any).user_id = user_id;

        const error = (req.session as any).failureMessage;
        delete (req.session as any).failureMessage;
        const shift = frontDeskServices.getCurrentShift();

        const dashboardData = await frontDeskServices.getDashBoardData(hotelid,user_id);
        console.log(dashboardData);
        res.render("frontDesk/home", {
            error,
            hotelname: dashboardData.data.name,
            first_name: dashboardData.data.first_name,
            last_name: dashboardData.data.last_name,
            photo: dashboardData.data.photo_url,
            checkincount: dashboardData.hotelData,
            shift
        
        });
    } catch (err: any) {
        (req.session as any).failureMessage = err.message
        res.redirect("/frontDesk/logout");
    }
}



//logout a frontDesk user
export const logout = async (req: Request, res: Response) => {
    try {
        res.clearCookie("token");
        delete (req.session as any).hotel_id;
        delete (req.session as any).user_id;
        res.redirect("/login");
    } catch (err: any) {
        (req.session as any).failureMessage = err.message
        res.redirect("/frontDesk/home");
    }
}