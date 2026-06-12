# Booking Module — Complete Code Explanation
## Line-by-Line Breakdown & Full Flow

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [booking.model.ts — Database Layer](#2-bookingmodelts--database-layer)
3. [booking.service.ts — Business Logic Layer](#3-bookingservicets--business-logic-layer)
4. [booking.controller.ts — HTTP Layer](#4-bookingcontrollerts--http-layer)
5. [booking.router.ts — Route Definitions](#5-bookingrouterts--route-definitions)
6. [Complete Flow — User Journey](#6-complete-flow--user-journey)
7. [Redis Key Map](#7-redis-key-map)
8. [Data Shape at Each Stage](#8-data-shape-at-each-stage)
9. [Error Handling Map](#9-error-handling-map)

---

## 1. Architecture Overview

The booking module is split into 4 layers. Each layer has one job and talks only to the layer below it:

```
HTTP Request
     ↓
  ROUTER         — defines which URL maps to which controller function
     ↓
  CONTROLLER     — validates HTTP input, calls service, sends HTTP response
     ↓
  SERVICE        — all business logic (Redis holds, availability checks, transactions)
     ↓
  MODEL          — raw SQL queries, no logic, just DB operations
     ↓
MySQL + Redis
```

**Why this separation?**
- If you swap MySQL for PostgreSQL, only the model changes
- If you change business rules (e.g. hold TTL), only the service changes
- If you add a mobile API, you reuse the same service/model

---

## 2. `booking.model.ts` — Database Layer

This file contains **only SQL**. No logic, no Redis, no decisions. Every function takes inputs and returns DB results.

---

### `getAvailableRooms`

```ts
export const getAvailableRooms = async (
    hotel_id: number,
    room_type_id: number,
    checkin_date: string,
    checkout_date: string,
    qty: number
)
```

**Parameters explained:**
| Parameter | What it is | Example |
|-----------|-----------|---------|
| `hotel_id` | Which hotel we're searching in | `10` |
| `room_type_id` | Which room category (Deluxe, Suite etc) | `28` |
| `checkin_date` | Guest arrival date | `"2026-06-11"` |
| `checkout_date` | Guest departure date | `"2026-06-30"` |
| `qty` | How many rooms to return | `2` |

**The SQL query — broken into 3 parts:**

**Part 1 — SELECT what we need:**
```sql
SELECT
    r.room_id,       -- the unique ID of the physical room
    r.room_number,   -- "101", "202A" etc — human readable
    rt.type_name,    -- "Standard", "Deluxe", "Suite"
    rt.base_price AS rate_per_night  -- price per night for this room type
FROM rooms r
JOIN room_types rt ON r.room_type_id = rt.room_type_id
```
We JOIN rooms with room_types to get the type name and price alongside the room.

**Part 2 — Basic filters:**
```sql
WHERE r.hotel_id       = ?   -- only rooms in THIS hotel
  AND r.room_type_id   = ?   -- only rooms of THIS type
  AND r.room_status_id = 1   -- only PHYSICALLY AVAILABLE rooms
                             -- (1=AVAILABLE, 2=OCCUPIED, 3=DIRTY, 4=MAINTENANCE)
```
`room_status_id = 1` is the physical state check. A room under maintenance never shows up, even if no booking exists for those dates.

**Part 3 — Date overlap exclusion (the important bit):**
```sql
AND r.room_id NOT IN (
    SELECT br.room_id
    FROM booking_rooms br
    JOIN bookings b ON br.booking_id = b.booking_id
    WHERE b.hotel_id          = ?
      AND b.booking_status_id NOT IN (5)   -- 5 = CANCELLED, excluded
      AND b.checkin_date       < ?          -- existing checkout > our checkin
      AND b.checkout_date      > ?          -- existing checkin  < our checkout
)
```

This is a **date overlap check**. Two date ranges overlap when:
```
existing.checkin  < our.checkout
AND
existing.checkout > our.checkin
```

Visual example:
```
Existing booking:  |---Jun 15 ---- Jun 20---|
Our request:            |---Jun 17 ---- Jun 25---|
                              ↑ OVERLAP — room excluded

Existing booking:  |---Jun 01 ---- Jun 10---|
Our request:                                    |---Jun 15 ---- Jun 20---|
                                                     ↑ NO OVERLAP — room available
```

`NOT IN (5)` means we exclude CANCELLED bookings — a cancelled booking should free the room up for new guests.

**`LIMIT ?`** — We only return as many rooms as needed (qty). No point fetching 50 rooms if the guest wants 2.

---

### `createBooking`

```ts
export const createBooking = async (connection: any, data: { ... })
```

Notice it takes a `connection` parameter — **not the pool directly**. This is because `createBooking` is called inside a database transaction. The transaction must use the same connection for all its queries. If each query got its own connection from the pool, they'd be in separate transactions and the rollback wouldn't work.

```sql
INSERT INTO bookings
(hotel_id, user_id, booking_status_id, booking_source_id,
 booking_reference, checkin_date, checkout_date,
 adults, children, total_amount, special_requests)
VALUES (?,?,?,?,?,?,?,?,?,?,?)
```

**Key values passed in:**
- `booking_status_id: 2` → CONFIRMED (set by service)
- `booking_source_id: 1` → ONLINE (set by service)
- `booking_reference` → human-readable ID like `HBMS-A3X9K2`
- `total_amount` → pre-calculated: `rate × nights × rooms`

Returns `result.insertId` — the auto-incremented `booking_id` MySQL assigned to this new row. This ID is then used by all subsequent inserts (`booking_rooms`, `payments`).

---

### `createBookingRooms`

```ts
export const createBookingRooms = async (
    connection: any,
    bookingId: number,
    rooms: { room_id: number; rate_per_night: number }[]
)
```

Loops over each room and inserts one row per room into `booking_rooms`:

```sql
INSERT INTO booking_rooms (booking_id, room_id, rate_per_night)
VALUES (?, ?, ?)
```

**Why store `rate_per_night` here?**
This is a **price snapshot**. If the hotel changes its prices next month, this booking should still show the rate the guest agreed to at booking time. If you just JOIN to `room_types.base_price` dynamically, a price change would retroactively alter old invoices. The snapshot prevents that.

A group booking (3 rooms) creates 3 rows here, all linked to the same `booking_id`.

---

### `createPayment`

```ts
export const createPayment = async (connection: any, data: {
    hotel_id: number;
    booking_id: number;
    amount: number;
    payment_method_id: number;
})
```

```sql
INSERT INTO payments
(hotel_id, booking_id, payment_method_id, payment_status_id, amount)
VALUES (?, ?, ?, 1, ?)
-- payment_status_id = 1 = PENDING
```

Created as `PENDING` (status 1) because at this point, the booking is confirmed in our system but actual money movement hasn't been verified yet. The payment gateway (Razorpay, Stripe etc) will later call a webhook which updates this to `SUCCESS (2)` or `FAILED (3)`.

In the current dummy flow, the frontend calls `/payment-success` directly after confirming.

---

### `updatePaymentStatus`

```ts
export const updatePaymentStatus = async (
    booking_id: number,
    payment_status_id: number  // 2=SUCCESS, 3=FAILED, 4=REFUNDED
)
```

```sql
UPDATE payments
SET payment_status_id = ?,
    paid_at = CASE WHEN ? = 2 THEN NOW() ELSE NULL END
WHERE booking_id = ?
```

The `CASE WHEN` is clever — `paid_at` is only set to the current timestamp when status is `2` (SUCCESS). For FAILED or REFUNDED, it stays NULL. This gives you an accurate audit trail of exactly when money was received.

---

### `getBookingByReference`

```ts
export const getBookingByReference = async (reference: string)
```

```sql
SELECT b.*, bs.status_name,
       h.name AS hotel_name, h.address, h.city, h.country,
       u.first_name, u.last_name, u.email
FROM bookings b
JOIN booking_statuses bs ON b.booking_status_id = bs.booking_status_id
JOIN hotels h             ON b.hotel_id = h.hotel_id
JOIN users u              ON b.user_id  = u.user_id
WHERE b.booking_reference = ?
```

A single query that JOINs 4 tables to return everything needed to display a booking confirmation page: booking details + status name + hotel info + guest name/email. Used on the "View Booking" page.

---

## 3. `booking.service.ts` — Business Logic Layer

This is the brain of the booking system. It coordinates Redis + MySQL, handles the hold lifecycle, and ensures atomicity.

---

### Helper: `generateReference`

```ts
const generateReference = (): string => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let ref = "";
    for (let i = 0; i < 6; i++) ref += chars[Math.floor(Math.random() * chars.length)];
    return `HBMS-${ref}`;
};
```

Generates IDs like `HBMS-A3X9K2`. 36 possible characters × 6 positions = 36^6 = ~2.1 billion combinations. Readable over the phone by front desk staff. Not a UUID because `HBMS-A3X9K2` is easier to read than `f59361f3-2858-482a-bf6f-cb916bef6c2a`.

> **Note:** In production, add a DB uniqueness check or use a sequence-based approach to prevent the tiny collision risk.

---

### Helper: `calcNights`

```ts
const calcNights = (checkin: string, checkout: string): number => {
    const nights = Math.ceil(
        (new Date(checkout).getTime() - new Date(checkin).getTime())
        / (1000 * 60 * 60 * 24)
    );
    if (nights <= 0) throw new Error("Check-out must be after check-in");
    return nights;
};
```

**How it works:**
- `new Date(checkout).getTime()` → milliseconds since epoch
- Subtract checkin milliseconds → difference in milliseconds
- Divide by `(1000 × 60 × 60 × 24)` → convert to days
- `Math.ceil` rounds up — a checkout at noon still counts as a full night

**Why throw if `nights <= 0`?**  
If someone passes `checkin: "2026-06-20"` and `checkout: "2026-06-18"` (checkout before checkin), this would produce a negative total_amount. The throw catches this before any DB writes.

---

### Helper: `getHeldRoomIds`

```ts
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
```

**What it does:**
Redis stores a key `room_held:{room_id}` → `hold_id` for every room currently being held by any user. This function scans all those keys and returns the room IDs.

**Step by step:**
1. `redis.keys("room_held:*")` → get all keys matching pattern e.g. `["room_held:96", "room_held:97"]`
2. If none, return empty array immediately
3. For each key, get the value (the hold_id that owns this room)
4. `if (excludeHoldId && holdId === excludeHoldId) continue` → skip rooms belonging to OUR OWN hold (used during `confirmBooking` re-verification — we don't want to block ourselves)
5. Parse the room ID from the key: `"room_held:96".split(":")[1]` → `"96"` → `Number("96")` → `96`
6. `isNaN` check guards against malformed keys

**`excludeHoldId` parameter explained:**
During `confirmBooking`, we call `getHeldRoomIds(hold_id)` — passing our own hold_id. Without this exclusion, our own rooms would appear in the "currently held" list and we'd block ourselves from confirming.

---

### `holdBooking` — The Core Function

```ts
export const holdBooking = async (data: {
    hotel_id, user_id, checkin_date, checkout_date,
    adults, children, rooms, special_requests
})
```

**Step 1 — Calculate nights:**
```ts
const nights = calcNights(data.checkin_date, data.checkout_date);
```
Fails fast if dates are invalid before doing any DB/Redis work.

**Step 2 — Fetch hotel name:**
```ts
const [[hotelRow]]: any = await db.query(
    `SELECT name FROM hotels WHERE hotel_id = ?`,
    [data.hotel_id]
);
const hotel_name = hotelRow?.name || '';
```
`[[hotelRow]]` — double destructuring: outer `[]` unpacks the mysql2 result tuple (returns `[rows, fields]`), inner `[]` gets the first row. Optional chaining `?.name` handles the case where `hotel_id` doesn't exist.

Fetched here so it's stored in the Redis hold payload. The payment page needs it for the summary display without making an extra DB call.

**Step 3 — Get currently held room IDs:**
```ts
const currentlyHeldIds = await getHeldRoomIds();
```
Gets all rooms other users are currently holding. We'll filter these out from our DB results.

**Step 4 — Loop over requested room types:**
```ts
for (const item of data.rooms) {
    if (item.qty <= 0) continue;
```
`data.rooms` is an array like `[{ room_type_id: 28, qty: 2 }]`. We process each room type separately because a guest might request 1 Deluxe + 2 Standard.

**Step 5 — Fetch available rooms with buffer:**
```ts
let available = await bookingModel.getAvailableRooms(
    data.hotel_id, item.room_type_id,
    data.checkin_date, data.checkout_date,
    item.qty + currentlyHeldIds.length   // ← fetch extra
);
```
We fetch `qty + heldCount` rooms from DB. Why extra? Because the DB doesn't know about Redis holds — it might return rooms that are currently being held by other users mid-payment. We fetch extra so after filtering we still have enough.

**Example:** Guest wants 2 rooms. 3 rooms are currently Redis-held by other users. We fetch `2 + 3 = 5` rooms from DB, then filter out the 3 held ones, leaving 2 — exactly what the guest needs.

**Step 6 — Filter out Redis-held rooms:**
```ts
if (currentlyHeldIds.length > 0) {
    available = available.filter(
        (r: any) => !currentlyHeldIds.includes(r.room_id)
    );
}
```
The DB query couldn't exclude these (Redis state is invisible to MySQL). We filter them here in application code.

**Step 7 — Slice to exact quantity:**
```ts
available = available.slice(0, item.qty);

if (available.length < item.qty) {
    throw new Error(`Only ${available.length} room(s) available...`);
}
```
Take only what was requested. If even after fetching extra we still don't have enough, throw an error — the user sees "Only 1 room available for Standard".

**Step 8 — Build resolved rooms array:**
```ts
for (const room of available) {
    resolvedRooms.push({
        room_id:        room.room_id,
        room_type_id:   item.room_type_id,
        type_name:      room.type_name,
        rate_per_night: room.rate_per_night,  // MySQL DECIMAL — comes as string
    });
    total_amount += room.rate_per_night * nights;
}
```
Accumulates `total_amount` by multiplying each room's rate by nights.

> **Note:** `room.rate_per_night` from MySQL is a string (`"3200.00"`). Multiplying a string by a number in JS coerces it: `"3200.00" * 19 = 60800`. It works but is fragile — the updated service forces `Number()` conversion for safety.

**Step 9 — Build hold payload:**
```ts
const hold_id = uuidv4();  // e.g. "f59361f3-2858-482a-bf6f-cb916bef6c2a"

const holdPayload = {
    hold_id,
    hotel_name,          // "Grand Palace Hotel"
    hotel_id,            // 10
    user_id,             // 22
    checkin_date,        // "2026-06-11"
    checkout_date,       // "2026-06-30"
    nights,              // 19
    adults,              // 2
    children,            // 0
    rooms: resolvedRooms, // [{ room_id: 96, type_name: "Standard", rate_per_night: 3200 }]
    total_amount,        // 60800
    special_requests,    // ""
    created_at,          // "2026-06-11T10:28:08.466Z"
};
```
Everything the payment page and confirm flow needs, bundled into one object.

**Step 10 — Store in Redis:**
```ts
await redis.set(`hold:${hold_id}`, JSON.stringify(holdPayload), "EX", HOLD_TTL);
```
- Key: `hold:f59361f3-2858-482a-bf6f-cb916bef6c2a`
- Value: the JSON payload above
- `"EX", 600` → expires in 600 seconds (10 minutes)

After 600 seconds, Redis deletes this key automatically. No cron job needed.

**Step 11 — Lock individual rooms:**
```ts
for (const room of resolvedRooms) {
    await redis.set(`room_held:${room.room_id}`, hold_id, "EX", HOLD_TTL);
}
```
- Key: `room_held:96`
- Value: `"f59361f3-..."` (the hold that owns this room)
- Same TTL as the hold

This is what `getHeldRoomIds` reads. If a second user tries to book room 96 before the hold expires, step 6 filters it out. When the hold expires, this key also expires and the room becomes available again.

**Step 12 — Return to controller:**
```ts
return {
    success: true,
    hold_id,        // frontend needs this to redirect to payment page
    total_amount,
    nights,
    rooms: resolvedRooms,
    expires_in_seconds: HOLD_TTL,
};
```
**Note:** `hotel_name` is NOT in the return value — it's stored in the Redis payload. The return only goes to the search results page, which redirects to `/payment-page?hold_id=...`. The payment page gets the full data via `getHold`.

---

### `getHold`

```ts
export const getHold = async (hold_id: string) => {
    const raw = await redis.get(`hold:${hold_id}`);
    if (!raw) throw new Error("Hold expired or not found.");

    const hold = JSON.parse(raw);
    const ttl  = await redis.ttl(`hold:${hold_id}`);

    return { success: true, ...hold, expires_in_seconds: ttl };
};
```

`redis.ttl(key)` returns:
- Positive number → seconds remaining
- `-1` → key exists but has no expiry (shouldn't happen here)
- `-2` → key doesn't exist (expired or never created)

The `ttl` value is passed to the payment page to start the countdown timer from the actual remaining time, not always from 600. If a user refreshes the payment page 3 minutes in, the timer correctly starts at ~7:00 instead of resetting to 10:00.

`...hold` spread operator unpacks all hold fields into the return object — `hotel_name`, `rooms`, `total_amount`, etc are all available to the caller.

---

### `confirmBooking`

```ts
export const confirmBooking = async (hold_id: string, payment_method_id: number)
```

**Step 1 — Re-fetch hold from Redis:**
```ts
const raw = await redis.get(`hold:${hold_id}`);
if (!raw) throw new Error("Hold expired or not found.");
const hold = JSON.parse(raw);
```
If 10 minutes have passed since the hold was created, Redis has deleted this key. The user gets an error and is sent back to search. This is the expiry enforcement.

**Step 2 — Re-verify no room conflicts:**
```ts
const currentlyHeldIds = await getHeldRoomIds(hold_id); // excludes our own
const ourRoomIds = hold.rooms.map((r: any) => r.room_id);

for (const roomId of ourRoomIds) {
    if (currentlyHeldIds.includes(roomId)) {
        throw new Error("One or more rooms are no longer available.");
    }
}
```
Edge case protection: between when we created the hold and when the user confirms, the `room_held:` keys might have been modified (e.g., due to a Redis restart or a race condition). This check re-verifies our rooms are still locked to us.

`getHeldRoomIds(hold_id)` — passing our own hold_id excludes our rooms from the "held by others" list, so we don't block ourselves.

**Step 3 — Database transaction:**
```ts
const connection = await db.getConnection();
try {
    await connection.beginTransaction();
```
`db.getConnection()` pulls a dedicated connection from the pool. `beginTransaction()` means all subsequent queries on this connection are atomic — either ALL succeed, or ALL are rolled back.

**Step 4 — Insert booking:**
```ts
const booking_reference = generateReference();
const bookingId = await bookingModel.createBooking(connection, {
    booking_status_id: 2,  // CONFIRMED — not PENDING
    booking_source_id: 1,  // ONLINE
    ...
});
```
Goes straight to CONFIRMED (2) — not PENDING — because the payment is handled separately. The booking record is the reservation, payment is a separate concern.

**Step 5 — Insert booking rooms:**
```ts
await bookingModel.createBookingRooms(connection, bookingId, hold.rooms);
```
Creates one `booking_rooms` row per room. Each row stores the rate snapshot.

**Step 6 — Insert payment:**
```ts
await bookingModel.createPayment(connection, {
    hotel_id: hold.hotel_id,
    booking_id: bookingId,
    amount: hold.total_amount,
    payment_method_id: payment_method_id,  // 2=CARD, 3=UPI
});
```
Created as PENDING. Will be updated to SUCCESS when `markPaymentSuccess` is called.

**Step 7 — Commit:**
```ts
await connection.commit();
connection.release();
```
`commit()` makes all 3 inserts permanent simultaneously. `release()` returns the connection to the pool so other requests can use it.

**Step 8 — Clean up Redis:**
```ts
await redis.del(`hold:${hold_id}`);
for (const room of hold.rooms) {
    await redis.del(`room_held:${room.room_id}`);
}
```
Delete the hold and all room locks. This is done AFTER commit — if we deleted Redis keys before commit and the DB crashed, the rooms would appear available but have no booking record. Always clean Redis after DB success.

**Step 9 — Rollback on error:**
```ts
} catch (err) {
    await connection.rollback();
    connection.release();
    throw err;
}
```
If ANY of the 3 inserts fails (DB down, constraint violation, etc), `rollback()` undoes everything — no orphaned booking record, no orphaned booking_rooms, no orphaned payment. The Redis hold stays alive so the user can try again.

---

### `markPaymentSuccess` and `markPaymentFailed`

```ts
export const markPaymentSuccess = async (booking_id: number) => {
    await bookingModel.updatePaymentStatus(booking_id, 2); // SUCCESS
};

export const markPaymentFailed = async (booking_id: number) => {
    await bookingModel.updatePaymentStatus(booking_id, 3); // FAILED
};
```

Simple wrappers that call the model with the right status code. In the dummy flow, the frontend calls these directly. In production, `markPaymentSuccess` would be called from a Razorpay/Stripe webhook after the payment gateway confirms money was received.

---

## 4. `booking.controller.ts` — HTTP Layer

Controllers are thin — they just handle HTTP mechanics (parsing request, calling service, sending response).

---

### `paymentPage`

```ts
export const paymentPage = (req: Request, res: Response) => {
    const hold_id = req.query.hold_id as string;
    if (!hold_id) return res.redirect("/");
    res.render("booking/payment", { hold_id });
};
```

`req.query.hold_id` → reads from URL: `/payment-page?hold_id=f59361f3...`

`as string` cast → TypeScript types `req.query` values as `string | string[] | ParsedQs | ParsedQs[]` because query params can technically appear multiple times (`?a=1&a=2`). `as string` tells TypeScript "trust me, it's a single string".

`res.render("booking/payment", { hold_id })` → renders `views/booking/payment.ejs` and passes `hold_id` as a template variable.

> **Current limitation:** Only `hold_id` is passed — the full hold data is not. This means the EJS must fetch it client-side via `fetch('/bookings/hold/:id')` after the page loads, causing the brief blank state.
> **Fix:** Make this `async`, call `bookingService.getHold(hold_id)`, and pass `holdData` to the template so the page renders fully populated.

---

### `holdBooking`

```ts
export const holdBooking = async (req: Request, res: Response) => {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ success: false, error: "Login required" });
```

`(req as any).user` → the JWT middleware attaches the decoded token payload to `req.user`. TypeScript doesn't know about this custom property, so `as any` suppresses the type error. In production, extend the Express `Request` type instead.

```ts
    const { hotel_id, checkin_date, checkout_date, adults, children, rooms, special_requests } = req.body;

    if (!hotel_id || !checkin_date || !checkout_date || !rooms?.length) {
        return res.status(400).json({ success: false, error: "Missing required fields" });
    }
```

`rooms?.length` — optional chaining: if `rooms` is undefined, `?.length` returns `undefined` (falsy) instead of throwing `Cannot read property 'length' of undefined`.

```ts
    const result = await bookingService.holdBooking({
        hotel_id:  Number(hotel_id),
        user_id:   user.userId,       // from JWT payload
        adults:    Number(adults) || 1,   // default 1 if not provided
        children:  Number(children) || 0, // default 0 if not provided
        ...
    });
    res.json(result);
```

`Number(hotel_id)` — body values from JSON are already typed but from form submissions they'd be strings. `Number()` ensures they're always numeric.

`user.userId` — the field name in your JWT payload. **Verify this matches what your JWT middleware puts in** — some implementations use `user_id`, others `userId`, `id`, or `sub`.

Error handling:
```ts
    } catch (err: any) {
        console.error("HOLD ERROR:", err.message);
        res.status(400).json({ success: false, error: err.message });
    }
```
`err: any` → TypeScript requires explicit typing of caught errors since TS 4.0. Service errors (not enough rooms, invalid dates) are thrown as `Error` objects — `err.message` returns the human-readable message to the client.

---

### `getHold`

```ts
export const getHold = async (req: Request, res: Response) => {
    const data = await bookingService.getHold(req.params.hold_id as string);
    res.json(data);
```

`req.params.hold_id` → from route `/hold/:hold_id`. `as string` is the fix for the TypeScript error you saw — Express types params as `string | string[]`.

If hold doesn't exist, service throws, caught below:
```ts
    } catch (err: any) {
        res.status(404).json({ success: false, error: err.message });
    }
```
404 is correct here — the hold resource doesn't exist (expired or invalid ID).

---

### `confirmBooking`

```ts
export const confirmBooking = async (req: Request, res: Response) => {
    const { hold_id, payment_method_id } = req.body;

    if (!hold_id) {
        return res.status(400).json({ success: false, error: "hold_id is required" });
    }

    const result = await bookingService.confirmBooking(
        hold_id,
        Number(payment_method_id) || 2  // default to CARD if not provided
    );
    res.json(result);
```

`Number(payment_method_id) || 2` — if `payment_method_id` is `0`, `null`, `undefined`, or `NaN`, defaults to `2` (CARD). The payment page sends `2` for card tab, `3` for UPI tab.

---

### `paymentSuccess` and `paymentFailed`

```ts
export const paymentSuccess = async (req: Request, res: Response) => {
    const { booking_id } = req.body;
    if (!booking_id) return res.status(400).json({ ... });
    await bookingService.markPaymentSuccess(Number(booking_id));
    res.json({ success: true });
};
```

These are simple pass-through controllers. In the dummy flow, the payment EJS calls these directly. In production with Razorpay:
- You'd verify the webhook signature first
- Then call `markPaymentSuccess`
- These endpoints would be removed or locked behind webhook verification middleware

---

## 5. `booking.router.ts` — Route Definitions

```ts
import { validToken } from "../../../common/middlewares/verifyJWTToken";

const router = Router();

router.get("/payment-page",      bookingController.paymentPage);

router.post("/hold",   validToken, bookingController.holdBooking);
router.get("/hold/:hold_id",       bookingController.getHold);
router.post("/confirm",            bookingController.confirmBooking);
router.post("/payment-success",    bookingController.paymentSuccess);
router.post("/payment-failed",     bookingController.paymentFailed);
```

**`validToken` middleware on `/hold` only:**

| Route | Auth required | Why |
|-------|-------------|-----|
| `GET /payment-page` | No | Page render — the hold_id in URL is the auth |
| `POST /hold` | **Yes** | Must be logged in to create a booking |
| `GET /hold/:hold_id` | No | Payment page needs to fetch hold data |
| `POST /confirm` | No | Hold itself is the auth token |
| `POST /payment-success` | No | Would be webhook in production |
| `POST /payment-failed` | No | Would be webhook in production |

**Why is `/confirm` not protected?**  
The `hold_id` (a UUID) acts as a secret token — it's only known to the user who created the hold. An attacker would need to guess a 122-bit UUID. In production, you'd add `validToken` here too and verify `hold.user_id === req.user.userId`.

---

## 6. Complete Flow — User Journey

```
1. USER ON SEARCH RESULTS PAGE
   Selects rooms, clicks "Continue To Book"
        ↓
2. FRONTEND — createHold()
   POST /bookings/hold
   Body: { hotel_id, checkin_date, checkout_date, adults, children,
           rooms: [{ room_type_id: 28, qty: 1 }] }
        ↓
3. CONTROLLER — holdBooking()
   Validates user is logged in (JWT)
   Validates required fields present
        ↓
4. SERVICE — holdBooking()
   a. calcNights() — validate dates
   b. DB query: fetch hotel_name
   c. Redis: getHeldRoomIds() — who's holding what right now
   d. DB query: getAvailableRooms() — status=1 AND no booking overlap
   e. Filter: remove Redis-held rooms from results
   f. Slice: take only qty needed
   g. Build holdPayload with all booking data
   h. Redis SET hold:{uuid} = payload  EX 600
   i. Redis SET room_held:{room_id} = hold_id  EX 600
   j. Return { success, hold_id, total_amount, nights, rooms }
        ↓
5. FRONTEND — redirects
   window.location.href = `/bookings/payment-page?hold_id=${data.hold_id}`
        ↓
6. CONTROLLER — paymentPage()
   Reads hold_id from query param
   res.render("booking/payment", { hold_id })
        ↓
7. PAYMENT PAGE LOADS
   EJS renders with hold_id
   initPage() calls GET /bookings/hold/:hold_id
        ↓
8. CONTROLLER — getHold()
   SERVICE — getHold()
   Redis GET hold:{hold_id}
   Redis TTL hold:{hold_id} → seconds remaining
   Returns full hold payload + expires_in_seconds
        ↓
9. PAYMENT PAGE — populateSummary()
   Fills in hotel name, dates, rooms, prices
   startCountdown(expires_in_seconds) — shows timer
        ↓
10. USER FILLS PAYMENT DETAILS + CLICKS PAY
    processPayment() → validate() → simulate 2.5s delay
        ↓
11. FRONTEND — confirmBookingAPI()
    POST /bookings/confirm
    Body: { hold_id, payment_method_id: 2 }
        ↓
12. SERVICE — confirmBooking()
    a. Redis GET hold:{hold_id} — verify hold still alive
    b. getHeldRoomIds(hold_id) — verify no conflicts
    c. db.getConnection() + beginTransaction()
    d. createBooking() → INSERT bookings → returns booking_id
    e. createBookingRooms() → INSERT booking_rooms (rate snapshot)
    f. createPayment() → INSERT payments (PENDING)
    g. connection.commit()
    h. connection.release()
    i. Redis DEL hold:{hold_id}
    j. Redis DEL room_held:{room_id} for each room
    k. Return { success, booking_id, booking_reference }
        ↓
13. FRONTEND — calls /payment-success
    POST /bookings/payment-success
    Body: { booking_id }
        ↓
14. SERVICE — markPaymentSuccess()
    UPDATE payments SET payment_status_id = 2, paid_at = NOW()
        ↓
15. FRONTEND — showSuccessResult(booking_reference)
    Shows "Booking Confirmed! HBMS-A3X9K2"
    Button: "View Booking" → /bookings/my
```

---

## 7. Redis Key Map

| Key Pattern | Value | TTL | Purpose |
|-------------|-------|-----|---------|
| `hold:{uuid}` | JSON holdPayload | 600s | Full hold data |
| `room_held:{room_id}` | hold_id string | 600s | Room lock — prevents double booking |

**What happens when TTL expires (user abandons payment):**

Both keys expire automatically. The room becomes holdable again by the next user — `getHeldRoomIds()` won't return it, `getAvailableRooms()` will include it. No cleanup job needed.

The booking was never written to MySQL (only written in `confirmBooking`), so there's nothing to roll back in the database.

---

## 8. Data Shape at Each Stage

### After `holdBooking` (stored in Redis):
```json
{
  "hold_id": "f59361f3-2858-482a-bf6f-cb916bef6c2a",
  "hotel_id": 10,
  "hotel_name": "Grand Palace Hotel",
  "user_id": 22,
  "checkin_date": "2026-06-11",
  "checkout_date": "2026-06-30",
  "nights": 19,
  "adults": 2,
  "children": 0,
  "rooms": [
    {
      "room_id": 96,
      "room_type_id": 28,
      "type_name": "Standard",
      "rate_per_night": 3200
    }
  ],
  "total_amount": 60800,
  "special_requests": "",
  "created_at": "2026-06-11T10:28:08.466Z"
}
```

### After `confirmBooking` (written to MySQL):
```
bookings table:
  booking_id: 881
  hotel_id: 10
  user_id: 22
  booking_status_id: 2 (CONFIRMED)
  booking_source_id: 1 (ONLINE)
  booking_reference: "HBMS-A3X9K2"
  checkin_date: "2026-06-11"
  checkout_date: "2026-06-30"
  total_amount: 60800.00

booking_rooms table:
  booking_room_id: 1204
  booking_id: 881
  room_id: 96
  rate_per_night: 3200.00   ← snapshot

payments table:
  hotel_id: 10
  booking_id: 881
  payment_method_id: 2 (CARD)
  payment_status_id: 1 (PENDING)
  amount: 60800.00
  paid_at: NULL
```

### After `markPaymentSuccess`:
```
payments table:
  payment_status_id: 2 (SUCCESS)
  paid_at: "2026-06-11 10:30:45"
```

---

## 9. Error Handling Map

| Where | Error condition | What happens |
|-------|----------------|-------------|
| `calcNights` | checkout ≤ checkin | Throws — 400 response to client |
| `holdBooking` | Not enough rooms | Throws with count — 400 response |
| `holdBooking` | Hotel not found | `hotel_name` defaults to `""` — no crash |
| `getHold` | Hold expired / bad ID | Throws — 404 response / redirect to `/` |
| `confirmBooking` | Hold expired | Throws — 400, user told to start again |
| `confirmBooking` | Room conflict | Throws — 400, user told to search again |
| `confirmBooking` | DB error mid-transaction | Rollback — no partial data, Redis hold stays alive |
| `paymentPage` | No hold_id in URL | Redirect to `/` |
| `holdBooking` | Not logged in | 401 — "Login required" |

---

*End of Booking Module Documentation*