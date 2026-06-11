import { redis } from "../../../config/redis";
import { db }    from "../../../config/db";
import * as bookingModel from "../models/booking.model";
import { v4 as uuidv4 }  from "uuid";

const HOLD_TTL = Number(process.env.HOLD_TTL_SECONDS) || 600;

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

const generateReference = (): string => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let ref = "";
    for (let i = 0; i < 6; i++) ref += chars[Math.floor(Math.random() * chars.length)];
    return `HBMS-${ref}`;
};

const calcNights = (checkin: string, checkout: string): number => {
    const nights = Math.ceil(
        (new Date(checkout).getTime() - new Date(checkin).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (nights <= 0) throw new Error("Check-out must be after check-in");
    return nights;
};

/**
 * GET REDIS-HELD ROOM IDs
 * Returns room_ids currently held by OTHER holds
 */
const getHeldRoomIds = async (excludeHoldId?: string): Promise<number[]> => {
    const keys = await redis.keys("room_held:*");
    if (!keys.length) return [];

    const roomIds: number[] = [];
    for (const key of keys) {
        const holdId = await redis.get(key);
        if (excludeHoldId && holdId === excludeHoldId) continue;
        const roomId = Number(key.split(":")[1]);
        if (!isNaN(roomId)) roomIds.push(roomId);
    }
    return roomIds;
};

// ─────────────────────────────────────────────
// HOLD BOOKING
// ─────────────────────────────────────────────

export const holdBooking = async (data: {
    hotel_id: number;
    user_id: number;
    checkin_date: string;
    checkout_date: string;
    adults: number;
    children: number;
    rooms: { room_type_id: number; qty: number }[];
    special_requests?: string;
}) => {
    const nights = calcNights(data.checkin_date, data.checkout_date);
    
// add this at the start of holdBooking, after calcNights:
const [[hotelRow]]: any = await db.query(
    `SELECT name FROM hotels WHERE hotel_id = ?`,
    [data.hotel_id]
);
const hotel_name = hotelRow?.name || '';


    const currentlyHeldIds = await getHeldRoomIds();

    const resolvedRooms: {
        room_id: number;
        room_type_id: number;
        type_name: string;
        rate_per_night: number;
    }[] = [];

    let total_amount = 0;

    for (const item of data.rooms) {
        if (item.qty <= 0) continue;

        // fetch extra rooms to account for Redis-held ones
        let available = await bookingModel.getAvailableRooms(
            data.hotel_id,
            item.room_type_id,
            data.checkin_date,
            data.checkout_date,
            item.qty + currentlyHeldIds.length
        );

        // filter out Redis-held rooms
        if (currentlyHeldIds.length > 0) {
            available = available.filter(
                (r: any) => !currentlyHeldIds.includes(r.room_id)
            );
        }

        // take only what guest needs
        available = available.slice(0, item.qty);

        if (available.length < item.qty) {
            throw new Error(
                `Only ${available.length} room(s) available for "${available[0]?.type_name || `type #${item.room_type_id}`}"`
            );
        }

        for (const room of available) {
            resolvedRooms.push({
                room_id:        room.room_id,
                room_type_id:   item.room_type_id,
                type_name:      room.type_name,
                rate_per_night: room.rate_per_night,
            });
            total_amount += room.rate_per_night * nights;
        }
    }

    if (resolvedRooms.length === 0) throw new Error("No rooms selected");

    const hold_id = uuidv4();

    const holdPayload = {
        hold_id,
        hotel_name,
        hotel_id:         data.hotel_id,
        user_id:          data.user_id,
        checkin_date:     data.checkin_date,
        checkout_date:    data.checkout_date,
        nights,
        adults:           data.adults,
        children:         data.children,
        rooms:            resolvedRooms,
        total_amount,
        special_requests: data.special_requests || "",
        created_at:       new Date().toISOString(),
    };

    // save hold
    await redis.set(`hold:${hold_id}`, JSON.stringify(holdPayload), "EX", HOLD_TTL);

    // lock each room in Redis so other users can't hold them
    for (const room of resolvedRooms) {
        await redis.set(`room_held:${room.room_id}`, hold_id, "EX", HOLD_TTL);
    }

    return {
        success:            true,
        hold_id,
        total_amount,
        nights,
        rooms:              resolvedRooms,
        expires_in_seconds: HOLD_TTL,
    };
};

// ─────────────────────────────────────────────
// GET HOLD
// ─────────────────────────────────────────────

export const getHold = async (hold_id: string) => {
    const raw = await redis.get(`hold:${hold_id}`);
    if (!raw) throw new Error("Hold expired or not found. Please search again.");

    const hold = JSON.parse(raw);
    const ttl  = await redis.ttl(`hold:${hold_id}`);

    return { success: true, ...hold, expires_in_seconds: ttl };
};

// ─────────────────────────────────────────────
// CONFIRM BOOKING
// ─────────────────────────────────────────────

export const confirmBooking = async (
    hold_id: string,
    payment_method_id: number
) => {
    // get hold from Redis
    const raw = await redis.get(`hold:${hold_id}`);
    if (!raw) throw new Error("Hold expired or not found. Please start again.");

    const hold = JSON.parse(raw);

    // safety check — make sure no other hold has claimed our rooms
    const currentlyHeldIds = await getHeldRoomIds(hold_id);
    const ourRoomIds = hold.rooms.map((r: any) => r.room_id);

    for (const roomId of ourRoomIds) {
        if (currentlyHeldIds.includes(roomId)) {
            throw new Error("One or more rooms are no longer available. Please search again.");
        }
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. create booking
        const booking_reference = generateReference();
        const bookingId = await bookingModel.createBooking(connection, {
            hotel_id:          hold.hotel_id,
            user_id:           hold.user_id,
            booking_status_id: 2,  // CONFIRMED
            booking_source_id: 1,  // ONLINE
            booking_reference,
            checkin_date:      hold.checkin_date,
            checkout_date:     hold.checkout_date,
            adults:            hold.adults,
            children:          hold.children,
            total_amount:      hold.total_amount,
            special_requests:  hold.special_requests,
        });

        // 2. attach rooms to booking
        await bookingModel.createBookingRooms(connection, bookingId, hold.rooms);

        // 3. create payment as PENDING
        await bookingModel.createPayment(connection, {
            hotel_id:          hold.hotel_id,
            booking_id:        bookingId,
            amount:            hold.total_amount,
            payment_method_id: payment_method_id,
        });

        await connection.commit();
        connection.release();

        // 4. clean up Redis
        await redis.del(`hold:${hold_id}`);
        for (const room of hold.rooms) {
            await redis.del(`room_held:${room.room_id}`);
        }

        return {
            success:           true,
            booking_id:        bookingId,
            booking_reference,
            total_amount:      hold.total_amount,
            checkin_date:      hold.checkin_date,
            checkout_date:     hold.checkout_date,
            hotel_id:          hold.hotel_id,
        };

    } catch (err) {
        await connection.rollback();
        connection.release();
        throw err;
    }
};

// ─────────────────────────────────────────────
// PAYMENT STATUS UPDATES
// ─────────────────────────────────────────────

export const markPaymentSuccess = async (booking_id: number) => {
    await bookingModel.updatePaymentStatus(booking_id, 2); // SUCCESS
};

export const markPaymentFailed = async (booking_id: number) => {
    await bookingModel.updatePaymentStatus(booking_id, 3); // FAILED
};

