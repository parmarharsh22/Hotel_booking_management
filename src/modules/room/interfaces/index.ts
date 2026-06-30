import { RowDataPacket } from "mysql2/promise";

export interface AmenityTypes extends RowDataPacket{
    amenity_name:string;
}

export interface RoomRow extends RowDataPacket {
  room_id: number;
}

interface Room{
    room_id: number,

    max_adults: number,
    max_children: number,

    price: number,

    type: string,
  }

  interface Hotel{
    hotel_id:string,
    name:string,
    city:string,
    state:string,
    country:string,
    logo_url:string
    rooms:Room[]
  }

  interface FilteredHotelResult extends Hotel{
    available_rooms:number;
    starting_price:number;
  }

export {Room,Hotel,FilteredHotelResult}

export interface HotelDetails{
    hotel_id:Number,
    name:string,
    address:string,
    city:string,
    state:string,
    country:string,
    cover_url:string
}

export interface RoomType{
    room_type_id: Number,
    type: string,
    price: Number,
    photo_url: string,
    max_adults: Number,
    max_children: Number,
    available_rooms: Number,
    description:string,
    amenities: string[]
}

export interface RoomTypeRow extends RowDataPacket{
    room_type_name:string;
}

export interface searchHotelReqBody{
    location:string;
    checkIn:string;
    checkOut:string;
    rooms:number;
    adults:number;
    children?:number;
    priceFilter:number|undefined;
    roomTypesFilter:string[]|undefined;
    amenitiesFilter:string[]|undefined;
}

export interface SelectedRoomType{
    typeName:string,
    roomTypeId:number,
    quantity:number
}

export interface BookigData{
    hotelId:number,
    checkIn:string,
    checkOut:string,
    adults:number,
    children:number,
    selections:SelectedRoomType[]
}