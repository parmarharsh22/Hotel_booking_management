import { RowDataPacket } from "mysql2/promise";

export interface RoomTypeRow extends RowDataPacket{
    room_type_name:string;
}