import { db } from "../../../config/db";

/**
 * Get all hotels
 */
export const getAllHotels = async () => {
    const [rows] = await db.query(`
        SELECT 
            h.*,
            ts.status_name AS status_name
        FROM hotels h
        JOIN tenant_statuses ts 
            ON h.tenant_status_id = ts.tenant_status_id
        ORDER BY h.created_at DESC
    `);

    return rows;
};

/**
 * Insert hotel
 */
export const insertHotel = async (data: any) => {
    const {
        name,
        slug,
        address,
        city,
        state,
        country,
        phone,
        email,
        logo_url,
        cover_url,
        tenant_status_id = 1
    } = data;

    const [result]: any = await db.query(
        `INSERT INTO hotels 
        (tenant_status_id, name, slug, address, city, state, country, phone, email, logo_url, cover_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            tenant_status_id,
            name,
            slug,
            address,
            city,
            state,
            country,
            phone,
            email,
            logo_url,
            cover_url
        ]
    );

    return result.insertId;
};

/**
 * Get hotel by ID
 */
export const getHotelById = async (hotelId: number) => {
    const [rows]: any = await db.query(
        `SELECT * FROM hotels WHERE hotel_id = ?`,
        [hotelId]
    );

    return rows.length ? rows[0] : null;
};

/**
 * Update hotel
 */
export const updateHotel = async (hotelId: number, data: any) => {
    const {
        name,
        address,
        city,
        state,
        country,
        phone,
        email,
        logo_url,
        cover_url
    } = data;

    await db.query(
        `UPDATE hotels 
        SET name=?, address=?, city=?, state=?, country=?, phone=?, email=?, logo_url=?, cover_url=?
        WHERE hotel_id=?`,
        [
            name,
            address,
            city,
            state,
            country,
            phone,
            email,
            logo_url,
            cover_url,
            hotelId
        ]
    );
};

/**
 * Update status
 */
export const updateHotelStatus = async (hotelId: number, statusId: number) => {
    await db.query(
        `UPDATE hotels SET tenant_status_id=? WHERE hotel_id=?`,
        [statusId, hotelId]
    );
};

/**
 * Soft delete hotel
 */
export const deleteHotel = async (hotelId: number) => {
    await db.query(
        `UPDATE hotels SET tenant_status_id=3 WHERE hotel_id=?`, // assuming 3 = SUSPENDED
        [hotelId]
    );
};