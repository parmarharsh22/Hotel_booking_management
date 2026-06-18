
import { Request, Response } from "express";
import { db } from "../../../config/db";

export const fetchHotel = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const hotelId = (req as any).hotelId as number;
    // if(hotelId==undefined){
    //     return res.status(400).json({message:"Hotel ID Required"})
    // }
    const [rows]: any = await db.query(
      "SELECT * FROM hotels WHERE hotel_id = ?",
      [hotelId]
    );
    
    

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found"
      });
    }

    return res.status(200).json({
      success: true,
      hotel: rows[0]
    });

  } catch (error) {
    console.error("Error fetching hotel:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
export default fetchHotel;