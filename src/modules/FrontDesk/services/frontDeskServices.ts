import * as frontDeskModel from "../models/frondDeskModel"

//Get the data to be loaded in the dashboard
export const getDashBoardData = async (hotel_Id: number, user_id: number) => {
    const data = await frontDeskModel.frontDeskData(hotel_Id, user_id);
    if (!data) {
        throw new Error("Error in Fetching the data");
    }
    const hotelData = await frontDeskModel.hotelData(hotel_Id);
        return {
        data,
        hotelData
    };
}

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