import { Request, Response } from "express";
import { searchHotelReqBody } from "../interfaces/room.searchHotelReqBody.interface";
import * as roomService from "../services/roomServices";
import { BookigData } from "../interfaces/room.selectedRoomType.interface";
import { getJwtTokenValue } from "../../../common/utils/getRequestVariables";
import { log } from "node:console";

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
            children: data.children,
        };
        return res.render("roomsFrontend/searchresults", {
            hotels: hotels || [],
            query,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

export const hotelDetails = async (req: Request, res: Response) => {
    try {
        const hotelId = req.params["hotelId"] as string;
        const { location, checkIn, checkOut, hotelName, rooms, adults, children } =
            req.query;

        const parsedHotelId = parseInt(hotelId || "-1", 10);

        if (isNaN(parsedHotelId) || parsedHotelId <= 0) {
            return res.status(400).json({ error: "Invalid or missing Hotel ID" });
        }

        const { hotel, room_type } = await roomService.hotelDetails(
            parsedHotelId,
            String(checkIn || ""),
            String(checkOut || ""),
        );

        const query = {
            hotel_id: parsedHotelId,
            location,
            check_in: checkIn,
            check_out: checkOut,
            hotelName,
            rooms,
            adults,
            children,
        };

        res.render("roomsFrontend/hotelDetails", {
            hotel,
            room_type,
            query,
        });
    } catch (error) { }
};

export const createHold = async (req: Request, res: Response) => {
    const data: BookigData = req.body;

    try {
        const userId = getJwtTokenValue("userId", req);

        const result = await roomService.createHold(data, userId);

        res.status(200).json(result);                                         
    } catch (error: unknown) {

        if (error instanceof Error) {
            res.status(409).json({
                success: false,
                message: error.message,
            });
        } else {
            res.status(409).json({
                success: false,
                message: "An unknown error occurred",
            });
        }
    }
};

export const redirectPayment = (req: Request, res: Response) => {

    const bookedRoomDetails=(req.session as any).bookedRoomDetails;

    res.render('roomsFrontend/paymentPage')
}