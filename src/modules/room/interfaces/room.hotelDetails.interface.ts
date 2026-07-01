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