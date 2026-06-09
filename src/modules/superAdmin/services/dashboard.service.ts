import * as dashboardModel from "../models/dashboard.model";

export const getDashboardStats = async () => {
    const [
        hotels,
        users,
        bookings,
        revenue,
        rooms,
        revenueChart,
        bookingChart,
        recentBookings,
    ] = await Promise.all([
        dashboardModel.getHotelStats(),
        dashboardModel.getUserStats(),
        dashboardModel.getBookingStats(),
        dashboardModel.getRevenueStats(),
        dashboardModel.getRoomStats(),
        dashboardModel.getRevenueChart(),
        dashboardModel.getBookingChart(),
        dashboardModel.getRecentBookings(),
    ]);

    return {
        hotels,
        users,
        bookings,
        revenue,
        rooms,
        revenueChart,
        bookingChart,
        recentBookings,
    };
};
