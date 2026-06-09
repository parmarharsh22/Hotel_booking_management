import { db } from "../../../config/db";

export interface RoomTypeInterface {
  room_type_id?:  number;
  hotel_id:       number;
  type_name:      string;
  photo_url?:     string | null;
  description?:   string | null;
  base_price:     number;
  max_adults: number;
  max_children: number;
  created_at?:    Date;
}


export interface RoomTypeUpdateInterface {
  type_name?:     string;
  photo_url?:     string | null;
  description?:   string | null;
  base_price?:    number;
  max_adults?: number;
  max_children?: number;
}

export class RoomTypeModel {

  // GET /admin/room-types  →  listRoomTypes
  static async getAllRoomTypes(hotelId: number): Promise<RoomTypeInterface[]> {
    try {
      const [rows]: any = await db.query(
        `SELECT 
           rt.*,
           COUNT(r.room_id) AS room_count
         FROM room_types rt
         LEFT JOIN rooms r ON rt.room_type_id = r.room_type_id
         WHERE rt.hotel_id = ?
         GROUP BY rt.room_type_id
         ORDER BY rt.type_name ASC`,
        [hotelId]
      );
      return rows;
    } catch (err: any) {
      throw err;
    }
  }

    // GET /admin/room-types/:typeId  →  used in showEditRoomType
    static async getRoomTypeById(typeId: number, hotelId: number): Promise<any> {
    try {
      // fetch the room type itself
      const [rows]: any = await db.query(
        `SELECT * FROM room_types 
         WHERE room_type_id = ? AND hotel_id = ?`,
        [typeId, hotelId]
      );
      if (rows.length === 0) return null;

      // fetch amenities already linked to this room type
      const [amenities]: any = await db.query(
        `SELECT a.amenity_id, a.amenity_name
         FROM room_type_amenities rta
         INNER JOIN amenities a ON rta.amenity_id = a.amenity_id
         WHERE rta.room_type_id = ?`,
        [typeId]
      );

      return { ...rows[0], amenities };
    } catch (err: any) {
      throw err;
    }
  }

    // POST /admin/room-types  →  createRoomType
  static async createRoomType(roomType: RoomTypeInterface): Promise<RoomTypeInterface> {
    try {
      const [data]: any = await db.query(
        `INSERT INTO room_types (hotel_id, type_name, photo_url, description, base_price, max_adults, max_children)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          roomType.hotel_id,
          roomType.type_name,
          roomType.photo_url   ?? null,
          roomType.description ?? null,
          roomType.base_price,
          roomType.max_adults,
          roomType.max_children,
        ]
      );
      return { room_type_id: data.insertId, ...roomType };
    } catch (err: any) {
      throw err;
    }
  }

   // PUT /admin/room-types/:typeId  →  updateRoomType
  static async updateRoomType(typeId: number, hotelId: number, data: RoomTypeUpdateInterface): Promise<boolean> {
    try {
      console.log(data);
      const [result]: any = await db.query(
        `UPDATE room_types
         SET type_name     = ?,
             photo_url     = ?,
             description   = ?,
             base_price    = ?,
             max_adults = ?,
             max_children = ?,
         WHERE room_type_id = ? AND hotel_id = ?`,
        [
          data.type_name,
          data.photo_url     ?? null,
          data.description   ?? null,
          data.base_price,
          data.max_adults,
          data.max_children,
          typeId,
          hotelId,
        ]
      );
      return result.affectedRows > 0;
    } catch (err: any) {
      throw err;
    }
  }

  // DELETE /admin/room-types/:typeId  →  deleteRoomType
    static async deleteRoomType(typeId: number, hotelId: number): Promise<boolean> {
    try {
      const [result]: any = await db.query(
        `DELETE FROM room_types 
         WHERE room_type_id = ? AND hotel_id = ?`,
        [typeId, hotelId]
      );
      return result.affectedRows > 0;
    } catch (err: any) {
      throw err;
    }
  }


    // POST /admin/room-types/:typeId/amenities  →  addAmenity
  static async addAmenities(typeId: number, amenityIds: number[]): Promise<boolean> {
    try {
    // build bulk insert values → (typeId, 1), (typeId, 2), (typeId, 3)
    const values = amenityIds.map(id => [typeId, id]);
    await db.query(
      `INSERT IGNORE INTO room_type_amenities (room_type_id, amenity_id) VALUES ?`,
      [values]
    );
    return true;
    } catch (err: any) {
    throw err;
    }
  }


    // DELETE /admin/room-types/:typeId/amenities/:amenityId  →  removeAmenity
    static async removeAmenities(typeId: number, amenityIds: number[]): Promise<boolean> {
  try {
    await db.query(
      `DELETE FROM room_type_amenities 
       WHERE room_type_id = ? AND amenity_id IN (?)`,
      [typeId, amenityIds]
    );
    return true;
  } catch (err: any) {
    throw err;
  }
  }


    // helper — fetch all amenities (for the form dropdown)
    static async getAllAmenities(): Promise<any[]> {
    try {
      const [rows]: any = await db.query(
        `SELECT * FROM amenities ORDER BY amenity_name ASC`
      );
      return rows;
    } catch (err: any) {
      throw err;
    }
  }

  




}

