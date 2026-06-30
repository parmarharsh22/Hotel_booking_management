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