import * as tenantModel from "../models/tenant.model";
import bcrypt from "bcryptjs";
import { db } from "../../../config/db";

/**
 * LIST HOTELS
 */
export const listHotels = async () => {
    return await tenantModel.getAllHotels();
};

/**
 * SAFE SLUG GENERATOR (IMPORTANT FIX)
 */
const generateSlug = (name: string) => {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
};

/**
 * CREATE HOTEL + ADMIN USER (TRANSACTION SAFE)
 */
export const createHotel = async (body: any) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // 1. generate safe slug
        let slug = generateSlug(body.name);

        // optional: make slug unique (simple version)
        slug = `${slug}-${Date.now()}`;

        // 2. insert hotel
        const [hotelResult]: any = await connection.query(
            `INSERT INTO hotels 
            (tenant_status_id, name, slug, address, city, state, country, phone, email, logo_url, cover_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                1,
                body.name,
                slug,
                body.address,
                body.city,
                body.state,
                body.country,
                body.phone,
                body.email,
                body.logo_url,
                body.cover_url
            ]
        );

        const hotelId = hotelResult.insertId;

        // 3. create admin password
        const plainPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        // 4. insert ADMIN user
        await connection.query(
            `INSERT INTO users 
            (hotel_id, user_role_id, first_name, last_name, email, phone, password_hash, state, city)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                hotelId,
                2, // ADMIN
                body.admin_first_name,
                body.admin_last_name,
                body.admin_email,
                body.phone,
                hashedPassword,
                body.state,
                body.city
            ]
        );

        // 5. commit transaction
        await connection.commit();
        connection.release();

        // 6. simulate email
        console.log("=== HOTEL CREATED SUCCESSFULLY ===");
        console.log("Hotel ID:", hotelId);
        console.log("Admin Email:", body.admin_email);
        console.log("Admin Password:", plainPassword);

        return hotelId;

    } catch (err) {
        await connection.rollback();
        connection.release();
        throw err;
    }
};

/**
 * HOTEL DETAIL + STATS
 */
export const getHotel = async (hotelId: number) => {
    const hotel = await tenantModel.getHotelById(hotelId);

    const [[stats]]: any = await db.query(`
        SELECT COUNT(user_id) AS total_users
        FROM users
        WHERE hotel_id = ?
    `, [hotelId]);

    return { hotel, stats };
};

/**
 * UPDATE HOTEL
 */
export const updateHotel = async (hotelId: number, body: any) => {
    await tenantModel.updateHotel(hotelId, body);
};

/**
 * CHANGE STATUS
 */
export const updateHotelStatus = async (hotelId: number, statusId: number) => {
    await tenantModel.updateHotelStatus(hotelId, statusId);
};

/**
 * SOFT DELETE
 */
export const deleteHotel = async (hotelId: number) => {
    await tenantModel.softDeleteHotel(hotelId);
};