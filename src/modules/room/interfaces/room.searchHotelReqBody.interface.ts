export interface searchHotelReqBody{
    location:string;
    check_in:string;
    check_out:string;
    rooms:number;
    adults:number;
    child?:number;
}