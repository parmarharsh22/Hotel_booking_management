import { Request, Response } from "express";
import * as dashboardService from "../services/dashboard.service";

export const dashboardPage = (req: Request, res: Response) => {
    res.render("superAdmin/dashboard");
};

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const data = await dashboardService.getDashboardStats();
        const dataSeed = {
    "hotels": {
        "total": 12,
        "active": 8,
        "suspended": 2,
        "pending": 2
    },
    "users": {
        "total": 147,
        "hotel_admins": 12,
        "front_desk": 34,
        "guests": 98
    },
    "bookings": {
        "total": 326,
        "pending": 18,
        "confirmed": 54,
        "checked_in": 41,
        "checked_out": 189,
        "cancelled": 24
    },
    "revenue": {
        "today": 48500.00,
        "this_month": 892300.50,
        "total_revenue": 5621800.75,
        "pending_payments": 124500.00
    },
    "rooms": {
        "total": 284,
        "available": 112,
        "occupied": 98,
        "dirty": 47,
        "maintenance": 27
    },
    "revenueChart": [
        { "date": "2026-06-03", "revenue": 62400.00 },
        { "date": "2026-06-04", "revenue": 78900.50 },
        { "date": "2026-06-05", "revenue": 54200.00 },
        { "date": "2026-06-06", "revenue": 91300.75 },
        { "date": "2026-06-07", "revenue": 43800.00 },
        { "date": "2026-06-08", "revenue": 67500.25 },
        { "date": "2026-06-09", "revenue": 48500.00 }
    ],
    "bookingChart": [
        { "date": "2026-06-03", "count": 14 },
        { "date": "2026-06-04", "count": 22 },
        { "date": "2026-06-05", "count": 9  },
        { "date": "2026-06-06", "count": 31 },
        { "date": "2026-06-07", "count": 17 },
        { "date": "2026-06-08", "count": 26 },
        { "date": "2026-06-09", "count": 11 }
    ],
    "recentBookings": [
        {
            "booking_reference": "HBMS-A3F2K9",
            "checkin_date": "2026-06-10",
            "checkout_date": "2026-06-14",
            "total_amount": 24800.00,
            "status_name": "CONFIRMED",
            "hotel_name": "Grand Palace Hotel",
            "first_name": "Rahul",
            "last_name": "Sharma"
        },
        {
            "booking_reference": "HBMS-B7X1M4",
            "checkin_date": "2026-06-09",
            "checkout_date": "2026-06-11",
            "total_amount": 8400.00,
            "status_name": "CHECKED_IN",
            "hotel_name": "Sea View Resort",
            "first_name": "Priya",
            "last_name": "Mehta"
        },
        {
            "booking_reference": "HBMS-C9P5R2",
            "checkin_date": "2026-06-07",
            "checkout_date": "2026-06-09",
            "total_amount": 12600.00,
            "status_name": "CHECKED_OUT",
            "hotel_name": "Mountain Escape Inn",
            "first_name": "James",
            "last_name": "Wilson"
        },
        {
            "booking_reference": "HBMS-D2L8Q6",
            "checkin_date": "2026-06-12",
            "checkout_date": "2026-06-15",
            "total_amount": 19200.00,
            "status_name": "PENDING",
            "hotel_name": "Grand Palace Hotel",
            "first_name": "Ayesha",
            "last_name": "Khan"
        },
        {
            "booking_reference": "HBMS-E4N3T7",
            "checkin_date": "2026-06-05",
            "checkout_date": "2026-06-08",
            "total_amount": 9600.00,
            "status_name": "CANCELLED",
            "hotel_name": "City Centre Suites",
            "first_name": "David",
            "last_name": "Patel"
        }
    ]
}

        res.json(dataSeed);
    } catch (err: any) {
        console.error(err.message);
        
        res.status(500).json({ error: "Failed to load dashboard" });
    }
};
