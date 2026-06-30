import * as roomModel from "../models/roomModel";
import { searchHotelReqBody } from "../interfaces/room.searchHotelReqBody.interface";
import {
  FilteredHotelResult,
  Hotel,
} from "../interfaces/room.avalibaleHotel.interface";
import { HotelDetails, RoomType } from "../interfaces/room.hotelDetails.interface";
import { BookigData } from "../interfaces/room.selectedRoomType.interface";
import { db } from "../../../config/db";
import { RoomRow } from "../interfaces/room.availableRoomsRow.interface";

export const searchHotels = async (params: searchHotelReqBody) => {
 const { location, checkIn, checkOut, rooms, adults, children, priceFilter, roomTypesFilter
    , amenitiesFilter } = params;

    const hotels_data = await roomModel.searchHotels(
    location,
    checkIn,
    checkOut,
    priceFilter,
    roomTypesFilter,
    amenitiesFilter
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
        logo_url: row.logo_url,

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

    const numberOfChild = Number(children ?? 0);

    if (
      hotel.rooms.length >= rooms &&
      totalAdults >= adults &&
      totalChildren >= numberOfChild
    ) {
      result.push({
        ...hotel,
        available_rooms: hotel.rooms.length,
        starting_price: Math.min(...hotel.rooms.map((r) => r.price)),
      });
    }
  }

  result.sort((a,b)=>a.starting_price-b.starting_price)

  return result;
};

export const hotelDetails = async (hotelId: number, checkIn: string, checkOut: string,priceFilter:number|undefined,roomTypes:string[]|undefined,amenities:string[]|undefined) => {
  const hotelDetails = await roomModel.hotelDetails(hotelId, checkIn, checkOut,priceFilter,roomTypes,amenities);

  let hotel: HotelDetails | undefined;
  let room_type: RoomType[] = [];

  for (let i = 0; i < hotelDetails.length; i++) {
    const element = hotelDetails[i];

    if (i == 0) {
      hotel = {
        hotel_id: Number(element.hotel_id),
        name: element.name,
        address: element.address,
        city: element.city,
        state: element.state,
        country: element.country,
        cover_url: element.cover_url
      }
    }

    room_type.push({
      room_type_id: element.room_type_id,
      photo_url: element.photo_url,
      type: element.type_name,
      price: element.base_price,
      max_adults: element.max_adults,
      max_children: element.max_children,
      available_rooms: element.available_rooms,
      description: element.description,
amenities: element.amenities
    ? element.amenities.split(',').map((item: string) => item.trim())
    : []    })
  }

  return { hotel, room_type };
}

export const createHold = async (bookingData: BookigData, userId: number) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();
    const heldRooms: RoomRow[] = [];

    for (const selection of bookingData.selections) {
      const rooms = await roomModel.getAvailableRooms(
        connection, bookingData.hotelId, selection.roomTypeId, bookingData.checkIn, bookingData.checkOut, selection.quantity
      )

      if (rooms.length < selection.quantity) {
        throw new Error(`${selection.quantity} rooms are occupied by someone else`)
      }

      heldRooms.push(...rooms);
    }

    await roomModel.insertRoomHolds(connection, heldRooms, userId, bookingData.checkIn, bookingData.checkOut, bookingData.adults, bookingData.children);

    await connection.commit();

    return { success: true };

  } catch (error) {
    await connection.rollback();

    throw error;
  }
  finally {
    connection.release();
  }
}

export const fetchFilterRoomTypes = async () => {
  return await roomModel.fetchFilterRoomTypes();
}

export const fetchAmenities = async () => {
  return await roomModel.fetchAmenities();
}

export const getFeaturedHotels = async () => {
    return await roomModel.getFeaturedHotels();
};