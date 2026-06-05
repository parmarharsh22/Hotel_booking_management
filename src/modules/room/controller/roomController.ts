import { Request, Response } from "express";
import { searchHotelReqBody } from "../interfaces/room.searchHotelReqBody.interface";

export const searchHotels=async (req:Request,res:Response)=>{
    const data:searchHotelReqBody=req.body;
    console.log(data);
}