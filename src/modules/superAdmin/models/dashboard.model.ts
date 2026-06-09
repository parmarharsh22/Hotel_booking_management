import { db } from "../../../config/db";

export const getHotelStats = async () => {
    const [[data]]: any = await db.query(`
        SELECT
            COUNT(*) AS total,
            SUM(tenant_status_id = 1) AS active,
            SUM(tenant_status_id = 2) AS suspended,
            SUM(tenant_status_id = 3) AS pending
        FROM hotels
    `);
    return data;
};

export const getUserStats = async () => {
    const [[data]]: any = await db.query(`
        SELECT
            COUNT(*) AS total,
            SUM(r.role_name = 'HOTEL_ADMIN') AS hotel_admins,
            SUM(r.role_name = 'FRONT_DESK')  AS front_desk,
            SUM(r.role_name = 'GUEST')        AS guests
        FROM users u
        JOIN user_roles r ON u.user_role_id = r.user_role_id
    `);
    return data;
};

export const getBookingStats = async () => {
    const [[data]]: any = await db.query(`
        SELECT
            COUNT(*) AS total,
            SUM(bs.status_name = 'PENDING')     AS pending,
            SUM(bs.status_name = 'CONFIRMED')   AS confirmed,
            SUM(bs.status_name = 'CHECKED_IN')  AS checked_in,
            SUM(bs.status_name = 'CHECKED_OUT') AS checked_out,
            SUM(bs.status_name = 'CANCELLED')   AS cancelled
        FROM bookings b
        JOIN booking_statuses bs ON b.booking_status_id = bs.booking_status_id
    `);
    return data;
};

export const getRevenueStats = async () => {
    const [[data]]: any = await db.query(`
        SELECT
            COALESCE(SUM(CASE WHEN DATE(paid_at) = CURDATE() THEN amount END), 0)       AS today,
            COALESCE(SUM(CASE WHEN MONTH(paid_at) = MONTH(CURDATE())
                              AND YEAR(paid_at)  = YEAR(CURDATE())  THEN amount END), 0) AS this_month,
            COALESCE(SUM(CASE WHEN ps.status_name = 'SUCCESS' THEN amount END), 0)      AS total_revenue,
            COALESCE(SUM(CASE WHEN ps.status_name = 'PENDING' THEN amount END), 0)      AS pending_payments
        FROM payments p
        JOIN payment_statuses ps ON p.payment_status_id = ps.payment_status_id
    `);
    return data;
};

export const getRoomStats = async () => {
    const [[data]]: any = await db.query(`
        SELECT
            COUNT(*) AS total,
            SUM(rs.status_name = 'AVAILABLE')   AS available,
            SUM(rs.status_name = 'OCCUPIED')    AS occupied,
            SUM(rs.status_name = 'DIRTY')       AS dirty,
            SUM(rs.status_name = 'MAINTENANCE') AS maintenance
        FROM rooms r
        JOIN room_statuses rs ON r.room_status_id = rs.room_status_id
    `);
    return data;
};

export const getRevenueChart = async () => {
    const [data]: any = await db.query(`
        SELECT
            DATE(paid_at) AS date,
            SUM(amount)   AS revenue
        FROM payments p
        JOIN payment_statuses ps ON p.payment_status_id = ps.payment_status_id
        WHERE ps.status_name = 'SUCCESS'
          AND paid_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        GROUP BY DATE(paid_at)
        ORDER BY date ASC
    `);
    return data;
};

export const getBookingChart = async () => {
    const [data]: any = await db.query(`
        SELECT
            DATE(created_at) AS date,
            COUNT(*)         AS count
        FROM bookings
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        GROUP BY DATE(created_at)
        ORDER BY date ASC
    `);
    return data;
};

export const getRecentBookings = async () => {
    const [data]: any = await db.query(`
        SELECT
            b.booking_reference,
            b.checkin_date,
            b.checkout_date,
            b.total_amount,
            bs.status_name,
            h.name       AS hotel_name,
            u.first_name,
            u.last_name
        FROM bookings b
        JOIN booking_statuses bs ON b.booking_status_id = bs.booking_status_id
        JOIN hotels h             ON b.hotel_id          = h.hotel_id
        JOIN users u              ON b.user_id           = u.user_id
        ORDER BY b.created_at DESC
        LIMIT 5
    `);
    return data;
};
