import { Request, Response } from "express";
import { searchHotelReqBody } from "../interfaces/room.searchHotelReqBody.interface";
import * as roomService from "../services/roomServices";
import { BookigData } from "../interfaces/room.selectedRoomType.interface";
import { getJwtTokenValue } from "../../../common/utils/getRequestVariables";
import NodeCache from 'node-cache';
import { RoomTypeRow } from "../interfaces/room.RoomTypeRow.interface";

const roomCache=new NodeCache({stdTTL:86400});

export const searchHotels = async (req: Request, res: Response) => {
    try {
        const cacheKey = "unique_room_types";
        let roomTypes:RoomTypeRow[]|undefined = roomCache.get(cacheKey);

        if (!roomTypes) {
            const rows = await roomService.fetchFilterRoomTypes();
            roomTypes = rows.sort();

            roomCache.set(cacheKey, roomTypes);
        } else {
            console.log("Served directly from CONTROLLER CACHE.");
        }

        const data: searchHotelReqBody = req.body;
      
        const hotels = await roomService.searchHotels(data);
        const amenities=await roomService.fetchAmenities();

        const query = {
            location: data.location,
            checkIn: data.checkIn,
            checkOut: data.checkOut,
            rooms: data.rooms,
            adults: data.adults,
            children: data.children,
            priceFilter:data.priceFilter,
            roomTypesFilter:data.roomTypesFilter,
            amenitiesFilter:data.amenitiesFilter
        };
       
        return res.render("roomsFrontend/searchresults", {
            hotels: hotels || [],
            roomTypes:roomTypes||[],
            amenities:amenities||[],
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
       
        const { location, checkIn, checkOut, hotelName, rooms, adults, children, priceFilter } =
            req.query;

        let roomTypes:string[] = [];
        let amenities:string[] = [];

        if (req.query.roomTypesFilter) {
            roomTypes = JSON.parse(req.query.roomTypesFilter as string) as string[];
        }
        if (req.query.amenitiesFilter) {
            amenities = JSON.parse(req.query.amenitiesFilter as string) as string[];
        }

        const parsedHotelId = parseInt(hotelId || "-1", 10);

        if (isNaN(parsedHotelId) || parsedHotelId <= 0) {
            return res.status(400).json({ error: "Invalid or missing Hotel ID" });
        }

        const { hotel, room_type } = await roomService.hotelDetails(
            parsedHotelId,
            String(checkIn || ""),
            String(checkOut || ""),
            parseInt(priceFilter as string || '20000'),
            roomTypes,
            amenities
        );

        const query = {
            hotel_id: parsedHotelId,
            location,
            checkIn: checkIn,
            checkOut: checkOut,
            hotelName,
            rooms,
            adults,
            children,
            priceFilter,
            roomTypes,
            amenities
        };

        res.render("roomsFrontend/hotelDetails", {
            hotel,
            room_type,
            query,
        });
    } catch (error) { console.error(error); }
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

export const renderHome = async (req: Request, res: Response) => {
    try {
        const featuredHotels = await roomService.getFeaturedHotels();

        return res.render("home/index", {  // ← your actual home view path
            user: (req as any).user || null,
            welcome: /* your existing welcome var */ null,
            featuredHotels,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal Server Error");
    }
};