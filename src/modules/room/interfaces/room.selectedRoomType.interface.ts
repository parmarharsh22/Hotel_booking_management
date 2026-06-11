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