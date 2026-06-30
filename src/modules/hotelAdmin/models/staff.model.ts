import { db } from "../../../config/db";

export interface StaffInterface {
  user_id?: number;
  hotel_id?: number | null;
  user_role_id?: number;
  first_name?: string;
  last_name?: string;
  email: string;
  phone?: string;
  dob?: Date;
  gender?: string;
  password_hash?: string;
  photo_url?: string;
  state ?: string;
  city ?: string;
  address?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface StaffUpdateInterface {
  first_name?: string;
  last_name?:  string;
  email?:      string;
  phone?:      string | null;
  photo_url?:  string | null;
  address?:    string | null;
}

export class StaffModel{

    // GET /admin/staff  →  listStaff
  static async getAllStaff(hotelId: number): Promise<StaffInterface[]> {
    try {
      const [rows]: any = await db.query(
        `SELECT 
           u.user_id,
           u.hotel_id,
           u.first_name,
           u.last_name,
           u.email,
           u.phone,
           u.photo_url,
           u.state,
           u.city,
           u.dob,
           u.gender,
           u.address,
           u.created_at,
           ur.role_name
         FROM users u
         INNER JOIN user_roles ur ON u.user_role_id = ur.user_role_id
         WHERE u.hotel_id = ?
           AND ur.role_name = 'FRONT_DESK'
         ORDER BY u.first_name ASC`,
        [hotelId]
      );
      return rows;
    } catch (err: any) {
      throw err;
    }
  }

   // GET /admin/staff/:userId/edit  →  showEditStaff
  static async getStaffById(userId: number, hotelId: number): Promise<StaffInterface | null> {
    try {
      const [rows]: any = await db.query(
        `SELECT 
           u.user_id,
           u.hotel_id,
           u.first_name,
           u.last_name,
           u.email,
           u.phone,
           u.photo_url,
           u.state,
           u.city,
           u.dob,
           u.gender,
           u.address,
           ur.role_name
         FROM users u
         INNER JOIN user_roles ur ON u.user_role_id = ur.user_role_id
         WHERE u.user_id = ? AND u.hotel_id = ?`,
        [userId, hotelId]
      );
      return rows[0] || null;
    } catch (err: any) {
      throw err;
    }
  }



  // POST /admin/staff  →  createStaff
  // always creates as FRONT_DESK — role_id comes from lookupIds constant
  static async createStaff(staff: StaffInterface): Promise<StaffInterface> {
    try {
      const [data]: any = await db.query(
        `INSERT INTO users (hotel_id, user_role_id, first_name, last_name, email, phone, dob, gender, password_hash, photo_url, state, city, address)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          staff.hotel_id,
          staff.user_role_id,
          staff.first_name,
          staff.last_name,
          staff.email,
          staff.phone    ?? null,
          staff.dob,
          staff.gender,
          staff.password_hash,
          staff.photo_url ?? null,
          staff.state,
          staff.city,
          staff.address
        ]
      );
      return { user_id: data.insertId, ...staff };
    } catch (err: any) {
      // ER_DUP_ENTRY = email already registered
      if (err.code === 'ER_DUP_ENTRY') {
        throw new Error("A user with this email already exists.");
      }
      throw err;
    }
  }

   // PUT /admin/staff/:userId  →  updateStaff
  // only updates profile fields — not role, not password, not hotel_id
  static async updateStaff(userId: number, hotelId: number, data: StaffUpdateInterface): Promise<boolean> {
    try {
      const [result]: any = await db.query(
        `UPDATE users
         SET first_name = ?,
             last_name  = ?,
             email      = ?,
             phone      = ?,
             photo_url  = ?,
             address    = ?
         WHERE user_id = ? AND hotel_id = ?`,
        [
          data.first_name,
          data.last_name,
          data.email,
          data.phone     ?? null,
          data.photo_url ?? null,
          data.address   ?? null,
          userId,
          hotelId,
        ]
      );
      return result.affectedRows > 0;
    } catch (err: any) {
      if (err.code === 'ER_DUP_ENTRY') {
        throw new Error("This email is already in use.");
      }
      throw err;
    }
  }


  // DELETE /admin/staff/:userId  →  deleteStaff
  static async deactivateStaff(userId: number, hotelId: number): Promise<boolean> {
    try {
      console.log(userId);
      console.log(hotelId);
      const [result]: any = await db.query(
        `delete from users where user_id = ${userId} AND hotel_id = ${hotelId}`,
      );
      console.log(result);
      return result.affectedRows > 0;
    } catch (err: any) {
      throw err;
    }
  }

}