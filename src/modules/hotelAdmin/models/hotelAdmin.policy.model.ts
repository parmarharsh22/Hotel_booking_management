import { db } from "../../../config/db";

export interface PolicyInterface {
  policy_id?:               number;
  hotel_id:                 number;
  room_type_id:             number;
  free_cancellation_hours:  number;
  refund_percentage:        number;
  created_at?:              Date;
}

export interface PolicyUpdateInterface {
  free_cancellation_hours?: number;
  refund_percentage?:       number;
}

export class PolicyModel {

  // GET /admin/policies  →  listPolicies
  static async getAllPoliciesByHotel(hotelId: number): Promise<PolicyInterface[]> {
    try {
      const [rows]: any = await db.query(
        `SELECT 
           cp.policy_id,
           cp.hotel_id,
           cp.room_type_id,
           cp.free_cancellation_hours,
           cp.refund_percentage,
           cp.created_at,
           rt.type_name,
           rt.base_price
         FROM cancellation_policies cp
         INNER JOIN room_types rt ON cp.room_type_id = rt.room_type_id
         WHERE cp.hotel_id = ?
         ORDER BY rt.type_name ASC`,
        [hotelId]
      );
      return rows;
    } catch (err: any) {
      throw err;
    }
  }

  // GET /admin/policies/:policyId/edit  →  showEditPolicy
  static async getPolicyById(policyId: number, hotelId: number): Promise<PolicyInterface | null> {
    try {
      const [rows]: any = await db.query(
        `SELECT 
           cp.*,
           rt.type_name,
           rt.base_price
         FROM cancellation_policies cp
         INNER JOIN room_types rt ON cp.room_type_id = rt.room_type_id
         WHERE cp.policy_id = ? AND cp.hotel_id = ?`,
        [policyId, hotelId]
      );
      return rows[0] || null;
    } catch (err: any) {
      throw err;
    }
  }

  // Used by the service to enforce the (hotel_id, room_type_id) unique constraint
  static async getPolicyByRoomType(hotelId: number, roomTypeId: number): Promise<PolicyInterface | null> {
    try {
      const [rows]: any = await db.query(
        `SELECT * FROM cancellation_policies
         WHERE hotel_id = ? AND room_type_id = ?`,
        [hotelId, roomTypeId]
      );
      return rows[0] || null;
    } catch (err: any) {
      throw err;
    }
  }

  // POST /admin/policies  →  createPolicy
  static async createPolicy(policy: PolicyInterface): Promise<PolicyInterface> {
    try {
      const [data]: any = await db.query(
        `INSERT INTO cancellation_policies (hotel_id, room_type_id, free_cancellation_hours, refund_percentage)
         VALUES (?, ?, ?, ?)`,
        [
          policy.hotel_id,
          policy.room_type_id,
          policy.free_cancellation_hours,
          policy.refund_percentage,
        ]
      );
      return { policy_id: data.insertId, ...policy };
    } catch (err: any) {
      throw err;
    }
  }

  // PUT /admin/policies/:policyId  →  updatePolicy
  // Only the two policy values change — room_type_id stays fixed (it defines the policy)
  static async updatePolicy(policyId: number, hotelId: number, data: PolicyUpdateInterface): Promise<boolean> {
    try {
      const [result]: any = await db.query(
        `UPDATE cancellation_policies
         SET free_cancellation_hours = ?,
             refund_percentage       = ?
         WHERE policy_id = ? AND hotel_id = ?`,
        [
          data.free_cancellation_hours,
          data.refund_percentage,
          policyId,
          hotelId,
        ]
      );
      return result.affectedRows > 0;
    } catch (err: any) {
      throw err;
    }
  }

  // DELETE /admin/policies/:policyId  →  deletePolicy
  static async deletePolicy(policyId: number, hotelId: number): Promise<boolean> {
    try {
      const [result]: any = await db.query(
        `DELETE FROM cancellation_policies WHERE policy_id = ? AND hotel_id = ?`,
        [policyId, hotelId]
      );
      return result.affectedRows > 0;
    } catch (err: any) {
      throw err;
    }
  }

}