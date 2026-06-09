import * as roomModel from "../models/roomModel";
import { searchHotelReqBody } from "../interfaces/room.searchHotelReqBody.interface";
import {
  FilteredHotelResult,
  Hotel,
} from "../interfaces/room.avalibaleHotel.interface";

export const searchHotels = async (params: searchHotelReqBody) => {
  const { location, check_in, check_out, rooms, adults, child } = params;

  const hotels_data = await roomModel.searchHotels(
    location,
    check_in,
    check_out,
    rooms,
    adults,
    child,
  );

  const hotels: Record<string, Hotel> = {};

  const result: FilteredHotelResult[] = [];

  for (const row of hotels_data) {
    if (!hotels[row.hotel_id]) {
      hotels[row.hotel_id] = {
        hotel_id: row.hotel_id,
        name: row.name,
        city: row.city,
        state: row.state,
        country: row.country,

        rooms: [],
      };
    }

    hotels[row.hotel_id].rooms.push({
      room_id: row.room_id,

      max_adults: row.max_adults,
      max_children: row.max_children,
      price: row.base_price,

      type: row.type_name,
    });
  }

  for (const hotel of Object.values(hotels)) {

    const totalAdults = hotel.rooms.reduce(
      (sum, room) => sum + room.max_adults,
      0,
    );

    const totalChildren = hotel.rooms.reduce(
      (sum, room) => sum + room.max_children,
      0,
    );

    const numberOfChild = Number(child ?? 0);

    if (
      hotel.rooms.length >= rooms &&
      totalAdults >= adults &&
      totalChildren >= numberOfChild
    ) {
      result.push({
        ...hotel,
        available_rooms:hotel.rooms.length,
        starting_price: Math.min(...hotel.rooms.map((r) => r.price)),
      });
    }
  }
//   console.log(result);
  return result;
};
