import { db } from "../../../config/db";
import { SuperAdminInterface } from "../models/superAdmin.auth.model";
import { SuperAdminModel } from "../models/superAdmin.auth.model";

export class SuperAdminService {
  async findByEmail(email: string): Promise<SuperAdminInterface> {
    try {
      if (!email) {
        throw new Error("Email is required");
      }
      const data = await SuperAdminModel.findByEmail(email);
      return data;
    } catch (err) {
      throw err;
    }
  }

  async getAllUserData(): Promise<SuperAdminInterface> {
    const data = await SuperAdminModel.getAllUserData();
    return data as SuperAdminInterface;
  }

  async findById(userId: number) {
    const [rows]: any = await db.query(
      `
      SELECT
        user_id,
        first_name,
        last_name,
        email,
        phone,
        hotel_id
      FROM users
      WHERE user_id = ?
    `,
      [userId],
    );

    return rows[0];
  }
}
