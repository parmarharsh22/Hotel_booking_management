import { Request, Response } from "express";
import { searchHotelReqBody } from "../interfaces/room.searchHotelReqBody.interface";
import * as roomService from "../services/roomServices";

export const searchHotels = async (req: Request, res: Response) => {
    try {
        const data: searchHotelReqBody = req.body;
        const hotels = await roomService.searchHotels(data);

        const query = {
            location: data.location,
            check_in: data.check_in,
            check_out: data.check_out,
            rooms: data.rooms,
            adults: data.adults,
            child:data.child
        };
        return res.render("roomsFrontend/searchresults", {
            hotels: hotels || [],
            query
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};