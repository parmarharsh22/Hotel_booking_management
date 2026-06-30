import { DashboardModel, RevenuePeriod } from "../models/dashboard.model";

export interface RevenueTrendResponse {
  period: RevenuePeriod;
  data: {
    label: string;
    revenue: number;
  }[];
}

export class DashboardService {
  async getRevenueTrend(
    hotelId: number,
    period: RevenuePeriod = "daily"
  ): Promise<RevenueTrendResponse> {
    try {
      if (!hotelId) {
        throw new Error("Hotel ID is required.");
      }

      // Fixed: Removed trailing spaces in array
      const allowedPeriods: RevenuePeriod[] = ["daily", "monthly", "yearly"];

      if (!allowedPeriods.includes(period)) {
        throw new Error("Invalid revenue period.");
      }

      const rows = await DashboardModel.getRevenueTrend(hotelId, period);
      let data: { label: string; revenue: number }[] = [];

      switch (period) { // Fixed: Removed trailing spaces in cases
        case "daily":
          data = this.buildDailyRevenue(rows);
          break;
        case "monthly":
          data = this.buildMonthlyRevenue(rows);
          break;
        case "yearly":
          data = this.buildYearlyRevenue(rows);
          break;
      }

      return { period, data };
    } catch (error) {
      throw error;
    }
  }

  private buildDailyRevenue(rows: any[]) {
    const revenueMap = new Map<string, number>();

    rows.forEach((row) => {
      // Fixed: Handle Date objects or strings safely to match MySQL DATE() output
      let label: string;
      if (row.period_label instanceof Date) {
        const d = row.period_label;
        label = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      } else {
        label = String(row.period_label).split(" ")[0];
      }
      revenueMap.set(label, Number(row.revenue));
    });

    const result = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      // Fixed: Use local date formatting instead of toISOString() to prevent timezone mismatch
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const key = `${year}-${month}-${day}`;

      const label = date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      });

      result.push({
        label,
        revenue: revenueMap.get(key) || 0,
      });
    }

    return result;
  }

  private buildMonthlyRevenue(rows: any[]) {
    const revenueMap = new Map<string, number>();

    rows.forEach((row) => {
      revenueMap.set(String(row.period_label), Number(row.revenue));
    });

    const result = [];

    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);

      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const label = date.toLocaleDateString("en-IN", { month: "short" });

      result.push({
        label,
        revenue: revenueMap.get(key) || 0,
      });
    }

    return result;
  }

  private buildYearlyRevenue(rows: any[]) {
    const revenueMap = new Map<number, number>();

    rows.forEach((row) => {
      revenueMap.set(Number(row.period_label), Number(row.revenue));
    });

    const currentYear = new Date().getFullYear();
    const result = [];

    for (let i = 4; i >= 0; i--) {
      const year = currentYear - i;
      result.push({
        label: String(year),
        revenue: revenueMap.get(year) || 0,
      });
    }

    return result;
  }

  async getBookingStatusDistribution(hotelId: number) {
    try {
      if (!hotelId) {
        throw new Error("Hotel ID is required.");
      }

      const rows = await DashboardModel.getBookingStatusDistribution(hotelId);

      const totalBookings = rows.reduce(
        (sum: number, row: any) => sum + Number(row.total_bookings),
        0
      );

      const data = rows.map((row: any) => ({
        status: row.status_name,
        count: Number(row.total_bookings),
        percentage:
          totalBookings > 0
            ? Number(
                ((Number(row.total_bookings) / totalBookings) * 100).toFixed(2)
              )
            : 0,
      }));

      return { totalBookings, data };
    } catch (error) {
      throw error;
    }
  }
}

export const dashboardService = new DashboardService();