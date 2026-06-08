import * as roomModel from '../models/roomModel'
import { searchHotelReqBody } from '../interfaces/room.searchHotelReqBody.interface' 

export const searchHotels=async (params:searchHotelReqBody)=>{
    const {location,check_in,check_out,guests,rooms}=params;

    return await roomModel.searchHotels(location,check_in,check_out,guests,rooms);
}