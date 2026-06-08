import { db } from "../../../config/db";

export interface SuperAdminInterface {
  user_id?: number;
  hotel_id?: number | null;
  user_role_id?: number;
  first_name?: string;
  last_name?: string;
  email: string;
  phone?: string;
  password_hash?: string;
  photo_url?: string;
  state ?: string;
  city ?: string;
  created_at?: Date;
  updated_at?: Date;
}


export interface UserInterface {

}

export class SuperAdminModel {

  static async findByEmail(email: string): Promise<SuperAdminInterface> {
    try {
      const [data]: any = await db.query(
        `SELECT 
          u.user_id,
          u.hotel_id,
          u.user_role_id,
          u.first_name,
          u.last_name,
          u.email,
          u.phone,
          u.password_hash,
          u.photo_url,
          u.state,
          u.city,
          ur.role_name
        FROM users u
        INNER JOIN user_roles ur ON u.user_role_id = ur.user_role_id
        WHERE u.email = ? AND ur.role_name = 'SUPER_ADMIN'`,
        [email]
      );

      if (data.length === 0) {
        throw new Error("Invalid credentials");
      }

      if (data[0].is_active === 0) {
        throw new Error("Account is deactivated");
      }

      return data[0];
    } catch (err: any) {
      throw err;
    }
    }

    static async getAllUserData():Promise<SuperAdminInterface>{
      try{
        const [data]: any = await db.query(`select * from users`);
        return data;
      }
      catch(err: any){
        throw err;
      }
    }


}