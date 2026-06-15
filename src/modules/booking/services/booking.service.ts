import { redis } from "../../../config/redis";
import { db }    from "../../../config/db";
import * as bookingModel from "../models/booking.model";
import { v4 as uuidv4 }  from "uuid";

const HOLD_TTL = Number(process.env.HOLD_TTL_SECONDS) || 600; // 10 minutes

// ─────────────────────────────────────────────────────────────────────────────
// SMALL HELPERS
// ─────────────────────────────────────────────────────────────────────────────

// Make a short human-readable booking code like "HBMS-A3X9K2"
const generateReference = (): string => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let ref = "";
    for (let i = 0; i < 6; i++) {
        ref += chars[Math.floor(Math.random() * chars.length)];
    }
    return `HBMS-${ref}`;
};

// How many nights between two dates
const calcNights = (checkin: string, checkout: string): number => {
    const ms     = new Date(checkout).getTime() - new Date(checkin).getTime();
    const nights = Math.ceil(ms / (1000 * 60 * 60 * 24));
    if (nights <= 0) throw new Error("Check-out must be after check-in");
    return nights;
};

// Get room IDs that OTHER users are currently holding in Redis
// Pass your own hold_id to skip your own rooms
const getRoomsHeldByOthers = async (skipHoldId?: string): Promise<number[]> => {
    const keys = await redis.keys("room_held:*");
    if (!keys.length) return [];

    const heldRoomIds: number[] = [];

    for (const key of keys) {
        const ownerHoldId = await redis.get(key);

        // skip rooms that belong to our own hold
        if (skipHoldId && ownerHoldId === skipHoldId) continue;

        const roomId = Number(key.split(":")[1]); // "room_held:96" → 96
        if (!isNaN(roomId)) heldRoomIds.push(roomId);
    }

    return heldRoomIds;
};

// ─────────────────────────────────────────────────────────────────────────────
// HOLD BOOKING
// Picks available rooms, locks them in Redis for 10 minutes.
// No DB writes yet — that only happens when user confirms payment.
// ─────────────────────────────────────────────────────────────────────────────

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

    // Get hotel name for the payment page summary
    const [[hotelRow]]: any = await db.query(
        `SELECT name FROM hotels WHERE hotel_id = ?`,
        [data.hotel_id]
    );
    const hotel_name: string = hotelRow?.name || "";

    // Rooms currently held by other users in Redis
    const roomsHeldByOthers = await getRoomsHeldByOthers();

    // We'll build this list as we loop over each requested room type
    const resolvedRooms: {
        room_id: number;
        room_type_id: number;
        type_name: string;
        rate_per_night: number;
    }[] = [];

    let total_amount = 0;

    // Loop each room type the guest wants (e.g. 1 Deluxe + 2 Standard)
    for (const item of data.rooms) {
        if (item.qty <= 0) continue;

        // Fetch more than needed from DB to account for Redis-held rooms
        // e.g. guest wants 2, but 3 are held → fetch 5, filter 3, keep 2
        const fetchQty = item.qty + roomsHeldByOthers.length;

        let availableRooms = await bookingModel.getAvailableRooms(
            data.hotel_id,
            item.room_type_id,
            data.checkin_date,
            data.checkout_date,
            fetchQty
        );

        // Remove rooms that are locked by other active holds in Redis
        availableRooms = availableRooms.filter(
            (room: any) => !roomsHeldByOthers.includes(room.room_id)
        );

        // Take only how many the guest needs
        availableRooms = availableRooms.slice(0, item.qty);

        // Not enough rooms → stop and tell the user
        if (availableRooms.length < item.qty) {
            const typeName = availableRooms[0]?.type_name || `type #${item.room_type_id}`;
            throw new Error(`Only ${availableRooms.length} room(s) available for "${typeName}"`);
        }

        // Add each room to our resolved list
        for (const room of availableRooms) {
            const rate = Number(room.rate_per_night); // MySQL DECIMAL comes as string
            resolvedRooms.push({
                room_id:        room.room_id,
                room_type_id:   item.room_type_id,
                type_name:      room.type_name,
                rate_per_night: rate,
            });
            total_amount += rate * nights;
        }
    }

    if (resolvedRooms.length === 0) throw new Error("No rooms selected");

    // Create a unique hold ID
    const hold_id = uuidv4();

    // Everything the payment page needs, stored in Redis
    const holdPayload = {
        hold_id,
        hotel_id:         data.hotel_id,
        hotel_name,
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

    // Save hold in Redis — auto-deletes after 10 minutes
    await redis.set(`hold:${hold_id}`, JSON.stringify(holdPayload), "EX", HOLD_TTL);

    // Lock each room so no other user can hold the same rooms
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

// ─────────────────────────────────────────────────────────────────────────────
// GET HOLD
// Reads the hold from Redis and returns it with remaining seconds.
// Used by the payment page to show the booking summary.
// ─────────────────────────────────────────────────────────────────────────────

export const getHold = async (hold_id: string) => {
    const raw = await redis.get(`hold:${hold_id}`);

    if (!raw) throw new Error("Hold expired or not found. Please search again.");

    const hold           = JSON.parse(raw);
    const secondsLeft    = await redis.ttl(`hold:${hold_id}`);

    return {
        success:            true,
        ...hold,
        expires_in_seconds: secondsLeft,
    };
};

// ─────────────────────────────────────────────────────────────────────────────
// CONFIRM BOOKING
// Called when user clicks Pay. Writes booking to DB, cleans up Redis.
// All DB inserts happen inside one transaction — if anything fails,
// everything rolls back and no partial data is saved.
// ─────────────────────────────────────────────────────────────────────────────

export const confirmBooking = async (hold_id: string, payment_method_id: number) => {

    // 1. Get hold from Redis — throws if expired
    const raw = await redis.get(`hold:${hold_id}`);
    if (!raw) throw new Error("Hold expired or not found. Please start again.");
    const hold = JSON.parse(raw);

    // 2. Double check none of our rooms were grabbed by someone else
    const roomsHeldByOthers = await getRoomsHeldByOthers(hold_id);
    const ourRoomIds         = hold.rooms.map((r: any) => r.room_id);

    for (const roomId of ourRoomIds) {
        if (roomsHeldByOthers.includes(roomId)) {
            throw new Error("One or more rooms are no longer available. Please search again.");
        }
    }

    // 3. Get a DB connection and start a transaction
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // 4. Create the booking record
        const booking_reference = generateReference();
        const bookingId = await bookingModel.createBooking(connection, {
            hotel_id:          hold.hotel_id,
            user_id:           hold.user_id,
            booking_status_id: 2, // CONFIRMED
            booking_source_id: 1, // ONLINE
            booking_reference,
            checkin_date:      hold.checkin_date,
            checkout_date:     hold.checkout_date,
            adults:            hold.adults,
            children:          hold.children,
            total_amount:      hold.total_amount,
            special_requests:  hold.special_requests,
        });

        // 5. Link the rooms to this booking (one row per room)
        await bookingModel.createBookingRooms(connection, bookingId, hold.rooms);

        // 6. Create a PENDING payment record
        await bookingModel.createPayment(connection, {
            hotel_id:          hold.hotel_id,
            booking_id:        bookingId,
            amount:            hold.total_amount,
            payment_method_id: payment_method_id,
        });

        // 7. Everything worked — save to DB permanently
        await connection.commit();
        connection.release();

        // 8. Clean up Redis — hold and room locks are no longer needed
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
        // Something went wrong — undo all DB writes, keep Redis hold alive
        await connection.rollback();
        connection.release();
        throw err;
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// PAYMENT STATUS
// In production these are called from a payment gateway webhook.
// In dev, the frontend calls them directly after confirm.
// ─────────────────────────────────────────────────────────────────────────────

export const markPaymentSuccess = async (booking_id: number) => {
    await bookingModel.updatePaymentStatus(booking_id, 2); // 2 = SUCCESS
};

export const markPaymentFailed = async (booking_id: number) => {
    await bookingModel.updatePaymentStatus(booking_id, 3); // 3 = FAILED
};