import { RowDataPacket } from 'mysql2/promise';

export interface RoomRow extends RowDataPacket {
  room_id: number;
}