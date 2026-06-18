import { db } from "../../../../config/db";

export type RevenuePeriod = "daily" | "monthly" | "yearly";

export interface RevenueTrendRow {
  label: string;
  revenue: number;
}

export class DashboardModel {

  static async getRevenueTrend(
    hotelId: number,
    period: RevenuePeriod
  ): Promise<any[]> {

    try {

      const validStatuses = [2, 3, 4];

      let query = "";
      let params: any[] = [];

      switch (period) {

        case "daily":

          query = `
            SELECT
              DATE(created_at) AS period_label,
              COALESCE(SUM(total_amount), 0) AS revenue
            FROM bookings
            WHERE hotel_id = ?
              AND booking_status_id IN (?,?,?)
              AND created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
            GROUP BY DATE(created_at)
            ORDER BY DATE(created_at)
          `;

          params = [
            hotelId,
            ...validStatuses
          ];

          break;

        case "monthly":

          query = `
            SELECT
              DATE_FORMAT(created_at, '%Y-%m') AS period_label,
              COALESCE(SUM(total_amount), 0) AS revenue
            FROM bookings
            WHERE hotel_id = ?
              AND booking_status_id IN (?,?,?)
              AND created_at >= DATE_SUB(CURDATE(), INTERVAL 11 MONTH)
            GROUP BY DATE_FORMAT(created_at, '%Y-%m')
            ORDER BY period_label
          `;

          params = [
            hotelId,
            ...validStatuses
          ];

          break;

        case "yearly":

          query = `
            SELECT
              YEAR(created_at) AS period_label,
              COALESCE(SUM(total_amount), 0) AS revenue
            FROM bookings
            WHERE hotel_id = ?
              AND booking_status_id IN (?,?,?)
              AND created_at >= DATE_SUB(CURDATE(), INTERVAL 4 YEAR)
            GROUP BY YEAR(created_at)
            ORDER BY YEAR(created_at)
          `;

          params = [
            hotelId,
            ...validStatuses
          ];

          break;

        default:
          throw new Error("Invalid revenue period.");
      }

      const [rows]: any = await db.query(query, params);

      return rows;

    } catch (error) {
      throw error;
    }
  }



static async getBookingStatusDistribution(
  hotelId: number
): Promise<any[]> {

  try {

    const [rows]: any = await db.query(
      `
      SELECT
          bs.status_name,
          COUNT(*) AS total_bookings
      FROM bookings b
      INNER JOIN booking_statuses bs
          ON b.booking_status_id = bs.booking_status_id
      WHERE b.hotel_id = ?
      GROUP BY
          bs.booking_status_id,
          bs.status_name
      ORDER BY
          bs.booking_status_id
      `,
      [hotelId]
    );

    return rows;

  } catch (error) {
    throw error;
  }
}



}