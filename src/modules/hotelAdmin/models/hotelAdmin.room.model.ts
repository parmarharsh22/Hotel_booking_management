import { db } from "../../../config/db";

export interface RoomInterface {
  room_id?:        number;
  hotel_id:        number;
  room_type_id:    number;
  room_status_id:  number;
  room_number:     string;
  floor?:          number | null;
  notes?:          string | null;
  created_at?:     Date;
}

export interface RoomUpdateInterface {
  room_type_id?:   number;
  room_number?:    string;
  floor?:          number | null;
  photo_url?:      string | null;
  notes?:          string | null;
}

export class RoomModel {

  static async getAllRoomsByHotel(hotelId: number): Promise<RoomInterface[]> {
    try {
      const [rows]: any = await db.query(
        `SELECT 
           r.room_id,
           r.hotel_id,
           r.room_number,
           r.floor,
           rt.photo_url,
           r.notes,
           r.created_at,
           rt.type_name,
           rt.base_price,
           rs.status_name
         FROM rooms r
         INNER JOIN room_types   rt ON r.room_type_id   = rt.room_type_id
         INNER JOIN room_statuses rs ON r.room_status_id = rs.room_status_id
         WHERE r.hotel_id = ?
         ORDER BY r.room_number ASC`,
        [hotelId]
      );
      return rows;
    } catch (err: any) {
      throw err;
    }
  }

   static async getRoomById(roomId: number, hotelId: number): Promise<RoomInterface | null> {
    try {
      const [rows]: any = await db.query(
        `SELECT 
           r.*,
           rt.type_name,
           rt.base_price,
           rs.status_name
         FROM rooms r
         INNER JOIN room_types   rt ON r.room_type_id   = rt.room_type_id
         INNER JOIN room_statuses rs ON r.room_status_id = rs.room_status_id
         WHERE r.room_id = ? AND r.hotel_id = ?`,
        [roomId, hotelId]
      );
      return rows[0] || null;
    } catch (err: any) {
      throw err;
    }
  }

    // POST /admin/rooms  →  createRoom
   static async createRoom(room: RoomInterface): Promise<RoomInterface> {
    try {
      const [data]: any = await db.query(
        `INSERT INTO rooms (hotel_id, room_type_id, room_status_id, room_number, floor, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          room.hotel_id,
          room.room_type_id,
          room.room_status_id,
          room.room_number,
          room.floor    ?? null,
          room.notes    ?? null,
        ]
      );
      return { room_id: data.insertId, ...room };
    } catch (err: any) {
      throw err;
    }
  }


    // PUT /admin/rooms/:roomId  →  updateRoom
   static async updateRoom(roomId: number, hotelId: number, data: RoomUpdateInterface): Promise<boolean> {
    try {
      const [result]: any = await db.query(
        `UPDATE rooms
         SET room_type_id = ?,
             room_number  = ?,
             floor        = ?,
             notes        = ?
         WHERE room_id = ? AND hotel_id = ?`,
        [
          data.room_type_id,
          data.room_number,
          data.floor     ?? null,
          data.notes     ?? null,
          roomId,
          hotelId,
        ]
      );
      return result.affectedRows > 0;
    } catch (err: any) {
      throw err;
    }
  }

  // DELETE /admin/rooms/:roomId  →  deleteRoom
  static async deleteRoom(roomId: number, hotelId: number): Promise<boolean> {
    try {
      const [result]: any = await db.query(
        `DELETE FROM rooms WHERE room_id = ? AND hotel_id = ?`,
        [roomId, hotelId]
      );
      return result.affectedRows > 0;
    } catch (err: any) {
      throw err;
    }
  }

   // PUT /admin/rooms/:roomId/status  →  updateRoomStatus
   static async updateRoomStatus(roomId: number, hotelId: number, roomStatusId: number): Promise<boolean> {
    try {
      const [result]: any = await db.query(
        `UPDATE rooms
         SET room_status_id = ?
         WHERE room_id = ? AND hotel_id = ?`,
        [roomStatusId, roomId, hotelId]
      );
      return result.affectedRows > 0;
    } catch (err: any) {
      throw err;
    }
  }


}