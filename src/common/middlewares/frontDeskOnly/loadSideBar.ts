import { Request,Response,NextFunction } from "express";
import  * as frontDeskServices  from "../../../modules/FrontDesk/services/frontDeskServices";
export const frontDeskContext = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = (req as any).user.userId;
        const hotelId = (req as any).hotelId;

        const dashboardData = await frontDeskServices.getDashBoardData(hotelId, userId);

        res.locals.photo = dashboardData.userData.photo_url;
        res.locals.first_name = dashboardData.userData.first_name;
        res.locals.last_name = dashboardData.userData.last_name;
        res.locals.shift = frontDeskServices.getCurrentShift();

        next();

    } catch (err) {
        next(err);
    }
};