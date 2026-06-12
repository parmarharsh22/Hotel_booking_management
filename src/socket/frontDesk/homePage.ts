import { getIo } from "../../../socket/socket";
import * as frontDeskService from "../../FrontDesk/services/frontDeskServices";

export const emitDashboardUpdate = async (
    hotelId: number
) => {

    const io = getIo();

    const dashboardData =
        await frontDeskService.getLiveDashboardData(
            hotelId
        );

    io.to(`hotel_${hotelId}`)
        .emit(
            "dashboardUpdate",
            dashboardData
        );
};