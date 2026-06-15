import { RowDataPacket } from "mysql2/promise";

export interface AmenityTypes extends RowDataPacket{
    amenity_name:string;
}