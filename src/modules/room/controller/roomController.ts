import { Request, Response } from "express";
import { searchHotelReqBody } from "../interfaces/room.searchHotelReqBody.interface";
import * as roomService from '../services/roomServices'

export const searchHotels=async (req:Request,res:Response)=>{
    const data:searchHotelReqBody=req.body;
    
    try {
        const hotels=await roomService.searchHotels(data);

        if(!hotels || hotels.length==0)
        {
            return res.status(200).json({
                success:true,
                message:'No hotels matched',
                data:[]
            })
        }

        return res.status(200).json({
            success:true,
            data:hotels
        })
    } catch (error) {
        console.error(error);
        
        return res.status(500).json({
            success:false,
            message:'Internal Server Error'
        })
    }
}