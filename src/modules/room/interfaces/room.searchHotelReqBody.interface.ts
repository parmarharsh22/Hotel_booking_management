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