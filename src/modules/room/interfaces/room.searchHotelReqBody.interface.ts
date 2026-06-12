export interface searchHotelReqBody{
    location:string;
    check_in:string;
    check_out:string;
    rooms:number;
    adults:number;
    children?:number;
    price_filter:number|undefined;
    roomTypes_filter:string[]|undefined;
    amenities_filter:string[]|undefined;
}