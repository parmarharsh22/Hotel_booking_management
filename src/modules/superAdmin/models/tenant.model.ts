import { db } from "../../../config/db";

/**
 * GET ALL HOTELS
 */
export const getAllHotels = async () => {
    const [rows]: any = await db.query(`
        SELECT 
            h.*,
            ts.status_name
        FROM hotels h
        JOIN tenant_statuses ts 
            ON h.tenant_status_id = ts.tenant_status_id
        ORDER BY h.created_at DESC
    `);

    return rows;
};

/**
 * CHECK SLUG EXISTS 
 */
export const checkSlugExists = async (slug: string) => {
    const [rows]: any = await db.query(
        `SELECT hotel_id FROM hotels WHERE slug = ? LIMIT 1`,
        [slug]
    );

    return rows.length > 0;
};

/**
 * INSERT HOTEL
 */
export const insertHotel = async (data: any) => {
    const [result]: any = await db.query(
        `INSERT INTO hotels 
        (tenant_status_id, name, slug, address, city, state, country, phone, email, logo_url, cover_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            data.tenant_status_id || 1,
            data.name,
            data.slug,
            data.address,
            data.city,
            data.state,
            data.country,
            data.phone,
            data.email,
            data.logo_url,
            data.cover_url
        ]
    );

    return result.insertId;
};

/**
 * GET HOTEL BY ID
 */
export const getHotelById = async (hotelId: number) => {
    const [rows]: any = await db.query(
        `SELECT * FROM hotels WHERE hotel_id = ? LIMIT 1`,
        [hotelId]
    );

    return rows.length ? rows[0] : null;
};

/**
 * UPDATE HOTEL
 */
export const updateHotel = async (hotelId: number, data: any) => {
    await db.query(
        `UPDATE hotels 
        SET name=?, address=?, city=?, state=?, country=?, phone=?, email=?, logo_url=?, cover_url=?
        WHERE hotel_id=?`,
        [
            data.name,
            data.address,
            data.city,
            data.state,
            data.country,
            data.phone,
            data.email,
            data.logo_url,
            data.cover_url,
            hotelId
        ]
    );
};

/**
 * UPDATE STATUS
 */
export const updateHotelStatus = async (hotelId: number, statusId: number) => {
    await db.query(
        `UPDATE hotels 
        SET tenant_status_id=? 
        WHERE hotel_id=?`,
        [statusId, hotelId]
    );
};

/**
 * SOFT DELETE (safer approach)
 */
export const softDeleteHotel = async (hotelId: number) => {
    await db.query(
        `UPDATE hotels 
        SET tenant_status_id=2 
        WHERE hotel_id=?`,
        [hotelId]
    );
};