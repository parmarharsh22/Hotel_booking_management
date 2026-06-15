# Booking Module — Code Explanation (v2)
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

The booking module is split into 4 layers. Each layer has one job and only talks to the layer directly below it.

```
HTTP Request
     ↓
  ROUTER        — maps a URL to a controller function
     ↓
  CONTROLLER    — reads the request, calls service, sends response
     ↓
  SERVICE       — all business logic (Redis holds, availability, transactions)
     ↓
  MODEL         — raw SQL queries only, no logic
     ↓
MySQL + Redis
```

**Why this separation?**
- Swap MySQL for PostgreSQL → only model changes
- Change business rules (e.g. hold duration) → only service changes
- Add a mobile API → reuse the same service and model

---

## 2. `booking.model.ts` — Database Layer

This file contains **only SQL queries**. No Redis, no business decisions. Every function takes inputs and returns database results.

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

**What each parameter means:**

| Parameter | What it is | Example |
|-----------|-----------|---------|
| `hotel_id` | Which hotel to search in | `10` |
| `room_type_id` | Which room category (Standard, Deluxe…) | `28` |
| `checkin_date` | Guest arrival date | `"2026-06-11"` |
| `checkout_date` | Guest departure date | `"2026-06-30"` |
| `qty` | How many rooms to return | `2` |

**The SQL — broken into 3 parts:**

**Part 1 — What to SELECT:**
```sql
SELECT
    r.room_id,
    r.room_number,
    rt.type_name,
    rt.base_price AS rate_per_night
FROM rooms r
JOIN room_types rt ON r.room_type_id = rt.room_type_id
```
Joins `rooms` with `room_types` to get the type name and price alongside each physical room.

**Part 2 — Basic filters:**
```sql
WHERE r.hotel_id       = ?   -- only rooms in this hotel
  AND r.room_type_id   = ?   -- only rooms of the requested type
  AND r.room_status_id = 1   -- only physically available rooms
```
`room_status_id = 1` means AVAILABLE. Rooms under maintenance (4) or occupied (2) are never shown even if no booking exists for the dates.

**Part 3 — Date overlap check:**
```sql
AND r.room_id NOT IN (
    SELECT br.room_id
    FROM booking_rooms br
    JOIN bookings b ON br.booking_id = b.booking_id
    WHERE b.hotel_id          = ?
      AND b.booking_status_id != 5        -- ignore CANCELLED bookings
      AND b.checkin_date       < ?        -- existing checkout is after our checkin
      AND b.checkout_date      > ?        -- existing checkin is before our checkout
)
```

Two date ranges overlap when:
```
existing.checkin  < our.checkout
AND
existing.checkout > our.checkin
```

Visual example:
```
Existing booking:   |── Jun 15 ──── Jun 20 ──|
Our request:                  |── Jun 17 ──── Jun 25 ──|
                                    ↑ OVERLAP → room excluded

Existing booking:   |── Jun 01 ──── Jun 10 ──|
Our request:                                      |── Jun 15 ──── Jun 20 ──|
                                                       ↑ NO OVERLAP → room available
```

`!= 5` excludes CANCELLED bookings — a cancelled booking should free the room back up.

**`LIMIT ?`** — only return as many rooms as needed. No point fetching 50 rooms when the guest wants 2.

---

### `createBooking`

```ts
export const createBooking = async (connection: any, data: { ... })
```

**Why it takes `connection` instead of using `db` directly:**
This function is called inside a database transaction. A transaction must use the **same connection** for all its queries. If each query grabbed its own connection from the pool, they'd be in separate transactions and rollback wouldn't work.

```sql
INSERT INTO bookings
(hotel_id, user_id, booking_status_id, booking_source_id,
 booking_reference, checkin_date, checkout_date,
 adults, children, total_amount, special_requests)
VALUES (?,?,?,?,?,?,?,?,?,?,?)
```

**Key values the service passes in:**
- `booking_status_id: 2` → CONFIRMED
- `booking_source_id: 1` → ONLINE
- `booking_reference` → human-readable ID like `HBMS-A3X9K2`
- `total_amount` → pre-calculated: `rate × nights × number of rooms`

Returns `result.insertId` — the auto-incremented `booking_id` MySQL assigned to this new row. Every subsequent insert (`booking_rooms`, `payments`) uses this ID.

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
This is a **price snapshot**. If the hotel raises prices next month, old bookings must still show the rate the guest originally agreed to. If you joined `room_types.base_price` dynamically, a price change would silently alter old invoices. Storing the rate at booking time prevents that.

A group booking of 3 rooms creates 3 rows here, all linked to the same `booking_id`.

---

### `createPayment`

```ts
export const createPayment = async (
    connection: any,
    data: { hotel_id, booking_id, amount, payment_method_id }
)
```

```sql
INSERT INTO payments
(hotel_id, booking_id, payment_method_id, payment_status_id, amount)
VALUES (?, ?, ?, 1, ?)
-- 1 = PENDING
```

Created as `PENDING` because at this point money hasn't actually moved yet — the booking is confirmed in our system but the payment gateway hasn't verified receipt. The status gets updated to `SUCCESS (2)` or `FAILED (3)` by `updatePaymentStatus` after the gateway responds.

---

### `updatePaymentStatus`

```ts
export const updatePaymentStatus = async (
    booking_id: number,
    payment_status_id: number  // 2=SUCCESS  3=FAILED  4=REFUNDED
)
```

```sql
UPDATE payments
SET payment_status_id = ?,
    paid_at = CASE WHEN ? = 2 THEN NOW() ELSE NULL END
WHERE booking_id = ?
```

`CASE WHEN ? = 2 THEN NOW() ELSE NULL END` — `paid_at` is only set to the current timestamp when the status is SUCCESS (2). For FAILED or REFUNDED it stays NULL. This gives an accurate audit trail of exactly when money was received.

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

One query that joins 4 tables to return everything needed on a booking confirmation page — booking details, status name, hotel info, and guest name/email. Used on "View Booking".

---

## 3. `booking.service.ts` — Business Logic Layer

This is the brain of the booking system. It coordinates Redis and MySQL, manages the hold lifecycle, and keeps everything atomic.

---

### Helper: `generateReference`

```ts
const generateReference = (): string => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let ref = "";
    for (let i = 0; i < 6; i++) {
        ref += chars[Math.floor(Math.random() * chars.length)];
    }
    return `HBMS-${ref}`;
};
```

Generates codes like `HBMS-A3X9K2`.

- 36 possible characters (A-Z + 0-9)
- 6 positions → 36⁶ = ~2.1 billion combinations
- Readable over the phone, easy for staff to type

Not a UUID because `HBMS-A3X9K2` is far easier to read aloud than `f59361f3-2858-482a-bf6f-cb916bef6c2a`.

> **Production note:** Add a uniqueness check against the DB or use a sequence-based approach to eliminate the tiny collision risk.

---

### Helper: `calcNights`

```ts
const calcNights = (checkin: string, checkout: string): number => {
    const ms     = new Date(checkout).getTime() - new Date(checkin).getTime();
    const nights = Math.ceil(ms / (1000 * 60 * 60 * 24));
    if (nights <= 0) throw new Error("Check-out must be after check-in");
    return nights;
};
```

**How it works step by step:**
1. `new Date(checkout).getTime()` → milliseconds since epoch (e.g. Jan 1 1970)
2. Subtract checkin milliseconds → difference in milliseconds
3. Divide by `1000 × 60 × 60 × 24` → convert ms to days
4. `Math.ceil` rounds up — a checkout at noon still counts as a full night

**Why throw if `nights <= 0`?**
If someone passes `checkin: "2026-06-20"` and `checkout: "2026-06-18"` (checkout before checkin), this produces a negative total_amount. The throw stops everything before any DB or Redis writes happen.

---

### Helper: `getRoomsHeldByOthers`

```ts
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
```

**What it does:**
Redis stores a key `room_held:{room_id}` → `hold_id` for every room currently held by any user. This function scans all those keys and returns the room IDs that are locked by OTHER users.

**Step by step:**
1. `redis.keys("room_held:*")` → finds all keys matching the pattern, e.g. `["room_held:96", "room_held:97"]`
2. If none exist, return an empty array immediately
3. For each key, get its value — the hold_id that owns this room lock
4. `if (skipHoldId && ownerHoldId === skipHoldId) continue` → skip rooms belonging to **our own** hold. This is needed during `confirmBooking` so we don't accidentally block ourselves
5. Parse the room ID from the key name: `"room_held:96".split(":")[1]` → `"96"` → `Number("96")` → `96`
6. `isNaN` guard ignores any malformed keys

**The `skipHoldId` parameter:**
During `confirmBooking`, we call `getRoomsHeldByOthers(hold_id)` — passing our own hold ID. Without this, our own room locks would appear in the "held by others" list and we'd block ourselves from confirming the booking.

---

### `holdBooking` — The Core Function

```ts
export const holdBooking = async (data: {
    hotel_id, user_id, checkin_date, checkout_date,
    adults, children, rooms, special_requests
})
```

**Step 1 — Validate dates and calculate nights:**
```ts
const nights = calcNights(data.checkin_date, data.checkout_date);
```
Fails fast if dates are invalid before touching Redis or the DB.

---

**Step 2 — Get hotel name for the payment page:**
```ts
const [[hotelRow]]: any = await db.query(
    `SELECT name FROM hotels WHERE hotel_id = ?`,
    [data.hotel_id]
);
const hotel_name: string = hotelRow?.name || "";
```

`[[hotelRow]]` — double destructuring:
- Outer `[]` unpacks mysql2's result tuple which is `[rows, fields]` — we only want `rows`
- Inner `[]` gets the first row from that array

`hotelRow?.name` — optional chaining. If `hotel_id` doesn't match any hotel, `hotelRow` is undefined and `?.name` returns undefined instead of throwing. Falls back to empty string.

Fetched here so `hotel_name` is stored inside the Redis hold payload — the payment page needs it for the summary without making an extra DB call.

---

**Step 3 — Find what rooms are already held by other users:**
```ts
const roomsHeldByOthers = await getRoomsHeldByOthers();
```
Gets all room IDs currently locked in Redis by other active holds. We'll filter these out before assigning rooms to this guest.

---

**Step 4 — Loop over each requested room type:**
```ts
for (const item of data.rooms) {
    if (item.qty <= 0) continue;
```
`data.rooms` is an array like `[{ room_type_id: 28, qty: 2 }]`. A guest might request 1 Deluxe AND 2 Standard — we process each type separately.

---

**Step 5 — Fetch rooms with a buffer:**
```ts
const fetchQty = item.qty + roomsHeldByOthers.length;

let availableRooms = await bookingModel.getAvailableRooms(
    data.hotel_id,
    item.room_type_id,
    data.checkin_date,
    data.checkout_date,
    fetchQty
);
```

We fetch more than needed from the DB. Why? The DB query doesn't know about Redis holds — it might return rooms that are currently mid-hold by another user. We fetch extra so after filtering we still have enough.

**Example:**
```
Guest wants:        2 rooms
Other users hold:   3 rooms in Redis
We fetch from DB:   2 + 3 = 5 rooms
After filtering:    5 - 3 = 2 rooms  ✓  exactly what the guest needs
```

---

**Step 6 — Filter out Redis-held rooms:**
```ts
availableRooms = availableRooms.filter(
    (room: any) => !roomsHeldByOthers.includes(room.room_id)
);
```
The DB query can't see Redis state — so we remove Redis-held rooms in application code after the query returns.

---

**Step 7 — Take only what the guest needs:**
```ts
availableRooms = availableRooms.slice(0, item.qty);

if (availableRooms.length < item.qty) {
    const typeName = availableRooms[0]?.type_name || `type #${item.room_type_id}`;
    throw new Error(`Only ${availableRooms.length} room(s) available for "${typeName}"`);
}
```
Slice to exact quantity. If we still don't have enough after filtering, throw a descriptive error — the user sees "Only 1 room available for Standard".

---

**Step 8 — Build the resolved rooms list:**
```ts
for (const room of availableRooms) {
    const rate = Number(room.rate_per_night); // MySQL DECIMAL comes back as string
    resolvedRooms.push({
        room_id:        room.room_id,
        room_type_id:   item.room_type_id,
        type_name:      room.type_name,
        rate_per_night: rate,
    });
    total_amount += rate * nights;
}
```

`Number(room.rate_per_night)` — MySQL `DECIMAL` columns return as strings (`"3200.00"`). Forcing to `Number` ensures arithmetic works correctly and `total_amount` is always a proper number.

---

**Step 9 — Build and store the hold payload in Redis:**
```ts
const hold_id = uuidv4(); // e.g. "f59361f3-2858-482a-bf6f-cb916bef6c2a"

const holdPayload = {
    hold_id,
    hotel_id, hotel_name,
    user_id,
    checkin_date, checkout_date, nights,
    adults, children,
    rooms: resolvedRooms,
    total_amount,
    special_requests,
    created_at: new Date().toISOString(),
};

await redis.set(`hold:${hold_id}`, JSON.stringify(holdPayload), "EX", HOLD_TTL);
```

- Key: `hold:f59361f3-...`
- Value: JSON string of everything the payment page and confirm flow needs
- `"EX", 600` → auto-deletes after 600 seconds (10 minutes). No cron job needed

---

**Step 10 — Lock each room in Redis:**
```ts
for (const room of resolvedRooms) {
    await redis.set(`room_held:${room.room_id}`, hold_id, "EX", HOLD_TTL);
}
```
- Key: `room_held:96`
- Value: the hold_id that owns this room
- Same TTL as the hold itself

This is what `getRoomsHeldByOthers` reads. If a second user tries to book room 96 before the 10 minutes expire, step 6 filters it out. When the hold expires, this key also expires and the room becomes available again automatically.

---

**Step 11 — Return to controller:**
```ts
return {
    success: true,
    hold_id,        // frontend needs this to build the payment page URL
    total_amount,
    nights,
    rooms: resolvedRooms,
    expires_in_seconds: HOLD_TTL,
};
```

Note `hotel_name` is NOT returned here — it's stored inside the Redis payload. This return value only goes to the search results page which immediately redirects to `/payment-page?hold_id=...`. The full payload is loaded on the payment page via `getHold`.

---

### `getHold`

```ts
export const getHold = async (hold_id: string) => {
    const raw = await redis.get(`hold:${hold_id}`);
    if (!raw) throw new Error("Hold expired or not found. Please search again.");

    const hold        = JSON.parse(raw);
    const secondsLeft = await redis.ttl(`hold:${hold_id}`);

    return { success: true, ...hold, expires_in_seconds: secondsLeft };
};
```

`redis.ttl(key)` returns:
- Positive number → seconds remaining on this key
- `-1` → key exists but has no expiry (shouldn't happen here)
- `-2` → key doesn't exist (expired or never created)

`secondsLeft` is passed to the payment page so the countdown timer starts from the **actual** remaining time. If the user refreshes the payment page 3 minutes in, the timer correctly starts at ~7:00 instead of resetting to 10:00.

`...hold` — spread operator unpacks all hold fields (`hotel_name`, `rooms`, `total_amount` etc) directly into the return object so the caller gets everything in one flat object.

---

### `confirmBooking`

```ts
export const confirmBooking = async (hold_id: string, payment_method_id: number)
```

**Step 1 — Fetch hold from Redis:**
```ts
const raw = await redis.get(`hold:${hold_id}`);
if (!raw) throw new Error("Hold expired or not found. Please start again.");
const hold = JSON.parse(raw);
```
If 10 minutes have passed since the hold was created, Redis deleted this key. The user gets an error and is redirected back to the search page. This is the expiry enforcement.

---

**Step 2 — Re-verify no room conflicts:**
```ts
const roomsHeldByOthers = await getRoomsHeldByOthers(hold_id);
const ourRoomIds         = hold.rooms.map((r: any) => r.room_id);

for (const roomId of ourRoomIds) {
    if (roomsHeldByOthers.includes(roomId)) {
        throw new Error("One or more rooms are no longer available.");
    }
}
```
Edge case protection: between when we created the hold and when the user confirms, the room locks might have been modified (Redis restart, rare race condition). This re-verifies our rooms are still ours.

`getRoomsHeldByOthers(hold_id)` — passing our own hold_id skips our own room locks so we don't block ourselves.

---

**Step 3 — Start a database transaction:**
```ts
const connection = await db.getConnection();
await connection.beginTransaction();
```
`getConnection()` pulls a dedicated connection from the pool. `beginTransaction()` means all queries on this connection are atomic — ALL succeed together, or ALL are rolled back together if anything fails.

---

**Steps 4, 5, 6 — The three DB inserts:**
```ts
// 4. Create the booking record
const booking_reference = generateReference();
const bookingId = await bookingModel.createBooking(connection, {
    booking_status_id: 2, // CONFIRMED — not PENDING
    booking_source_id: 1, // ONLINE
    ...
});

// 5. Link the rooms to this booking (one row per room)
await bookingModel.createBookingRooms(connection, bookingId, hold.rooms);

// 6. Create a PENDING payment record
await bookingModel.createPayment(connection, {
    booking_id: bookingId,
    payment_method_id,
    ...
});
```

The booking goes straight to CONFIRMED (2) because the payment is a separate concern — the booking IS confirmed, we're just waiting for the money to clear. These 3 inserts all use the same `connection` so they're inside the same transaction.

---

**Step 7 — Commit:**
```ts
await connection.commit();
connection.release();
```
`commit()` makes all 3 inserts permanent at the same moment. `release()` returns the connection to the pool so other requests can use it.

---

**Step 8 — Clean up Redis:**
```ts
await redis.del(`hold:${hold_id}`);
for (const room of hold.rooms) {
    await redis.del(`room_held:${room.room_id}`);
}
```
Delete the hold and all room locks. This happens **after** the commit — never before. If we deleted Redis first and the DB commit failed, the rooms would appear available but have a dangling booking record. Always clean Redis after DB success.

---

**On any error — rollback:**
```ts
} catch (err) {
    await connection.rollback();
    connection.release();
    throw err;
}
```
If ANY of the 3 inserts fail (DB down, duplicate key, network timeout), `rollback()` undoes all of them — no partial booking, no orphaned payment row. The Redis hold stays alive so the user can try again.

---

### `markPaymentSuccess` and `markPaymentFailed`

```ts
export const markPaymentSuccess = async (booking_id: number) => {
    await bookingModel.updatePaymentStatus(booking_id, 2); // 2 = SUCCESS
};

export const markPaymentFailed = async (booking_id: number) => {
    await bookingModel.updatePaymentStatus(booking_id, 3); // 3 = FAILED
};
```

Simple one-liners that call the model with the right status code. In the current dev flow, the payment page calls these directly after `confirmBooking`. In production with Razorpay or Stripe, `markPaymentSuccess` would be triggered by the payment gateway's webhook after it confirms money was received — these endpoints would be locked behind webhook signature verification.

---

## 4. `booking.controller.ts` — HTTP Layer

Controllers are intentionally thin. Their only job: read the HTTP request, call the service, and send the HTTP response. No business logic here.

---

### `paymentPage`

```ts
export const paymentPage = async (req: Request, res: Response) => {
    const hold_id = req.query.hold_id as string;

    if (!hold_id) return res.redirect("/");

    try {
        const holdData = await bookingService.getHold(hold_id);
        res.render("booking/payment", { hold_id, holdData });
    } catch {
        return res.redirect("/");
    }
};
```

`req.query.hold_id` → reads from the URL: `/payment-page?hold_id=f59361f3...`

`as string` cast → TypeScript types `req.query` values as `string | string[] | ParsedQs | ParsedQs[]` because query params can technically repeat (`?a=1&a=2`). `as string` tells TypeScript "treat this as a single string".

**Why `async` and why fetch `holdData` here?**
The old version was sync and only passed `hold_id` to the template. The EJS then had to do a second `fetch('/bookings/hold/:id')` call after the page loaded — that gap caused the blank blue bar you saw. Now we fetch hold data on the server before rendering, so the page loads fully populated with zero extra client requests.

`res.render("booking/payment", { hold_id, holdData })` → renders `views/booking/payment.ejs` and passes both variables into it. In the EJS: `<%- JSON.stringify(holdData) %>` dumps the full object into the page's JavaScript.

If the hold is expired or the `hold_id` is invalid, `getHold` throws and the catch block redirects to `/` instead of rendering a broken page.

---

### `holdBooking`

```ts
export const holdBooking = async (req: Request, res: Response) => {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ ... });
```

`(req as any).user` → the JWT middleware (`validToken`) attaches the decoded token payload to `req.user`. TypeScript doesn't know about this custom property, so `as any` suppresses the type error. In production, extend the Express `Request` type to declare `user` properly.

```ts
    const { hotel_id, checkin_date, checkout_date, adults, children, rooms, special_requests } = req.body;

    if (!hotel_id || !checkin_date || !checkout_date || !rooms?.length) {
        return res.status(400).json({ success: false, error: "Missing required fields" });
    }
```

`rooms?.length` — optional chaining. If `rooms` is undefined (wasn't sent), `?.length` returns `undefined` (falsy) instead of throwing `Cannot read property 'length' of undefined`.

```ts
    const result = await bookingService.holdBooking({
        hotel_id:  Number(hotel_id),
        user_id:   user.userId,
        adults:    Number(adults)   || 1,
        children:  Number(children) || 0,
        ...
    });
```

`Number(hotel_id)` — request body values are strings when they come from form submissions. `Number()` ensures they're always numeric before passing to the service.

`user.userId` — the field name from your JWT payload. **Verify this matches what your `validToken` middleware puts in** — it might be `user_id`, `id`, or `sub` depending on how the token was signed.

`Number(adults) || 1` — if adults is `0`, `null`, or `undefined`, defaults to `1`.

---

### `getHold`

```ts
export const getHold = async (req: Request, res: Response) => {
    const data = await bookingService.getHold(req.params.hold_id as string);
    res.json(data);
```

`req.params.hold_id` → from the route pattern `/hold/:hold_id`. The `:hold_id` part becomes `req.params.hold_id`.

`as string` — same reason as before. TypeScript types route params as `string` already, but the cast removes any linter warnings in some configs.

If the hold is expired, the service throws and the catch block returns a `404`:
```ts
    } catch (err: any) {
        res.status(404).json({ success: false, error: err.message });
    }
```
404 is correct — the hold resource doesn't exist (expired or bad ID).

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
        Number(payment_method_id) || 2  // default to CARD
    );
    res.json(result);
```

`Number(payment_method_id) || 2` — if `payment_method_id` is `0`, `null`, or `undefined`, defaults to `2` (CARD). The payment page sends `2` for the card tab and `3` for UPI.

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

Straight pass-through controllers. Validate input → call service → respond. In production these would verify a Razorpay/Stripe webhook signature before trusting the `booking_id`.

---

## 5. `booking.router.ts` — Route Definitions

```ts
// Page routes
router.get("/payment-page", bookingController.paymentPage);

// API routes
router.post("/hold",            validToken, bookingController.holdBooking);   // needs login
router.get("/hold/:hold_id",               bookingController.getHold);
router.post("/confirm",                    bookingController.confirmBooking);
router.post("/payment-success",            bookingController.paymentSuccess);
router.post("/payment-failed",             bookingController.paymentFailed);
```

**Why only `/hold` has `validToken`:**

| Route | Auth | Reason |
|-------|------|--------|
| `GET /payment-page` | No | Server renders the page — hold_id in URL is enough |
| `POST /hold` | **Yes** | Must be logged in to create a reservation |
| `GET /hold/:hold_id` | No | Payment page fetches this — hold_id acts as the token |
| `POST /confirm` | No | hold_id (a UUID) acts as implicit auth |
| `POST /payment-success` | No | Would be a webhook in production |
| `POST /payment-failed` | No | Would be a webhook in production |

**Why is `/confirm` not protected?**
The `hold_id` is a UUID — 122 bits of randomness. An attacker would need to guess correctly from 2^122 possibilities. It functions as a short-lived secret token. In production, add `validToken` and verify `hold.user_id === req.user.userId` inside the service.

---

## 6. Complete Flow — User Journey

```
1. USER SELECTS ROOMS on search results page
   Chooses room types and quantities, clicks "Continue To Book"
        ↓
2. FRONTEND calls POST /bookings/hold
   Body: {
     hotel_id: 10,
     checkin_date: "2026-06-11",
     checkout_date: "2026-06-30",
     adults: 2, children: 0,
     rooms: [{ room_type_id: 28, qty: 1 }]
   }
        ↓
3. CONTROLLER — holdBooking()
   ✓ User is logged in (JWT check)
   ✓ Required fields present
   → calls bookingService.holdBooking()
        ↓
4. SERVICE — holdBooking()
   a. calcNights() → 19 nights
   b. DB: fetch hotel_name → "Grand Palace Hotel"
   c. Redis: getRoomsHeldByOthers() → [97, 98] (rooms held by others)
   d. DB: getAvailableRooms(qty=1+2=3) → [room 96, room 99, room 100]
   e. Filter: remove [97,98] → [96, 99, 100] (none removed here)
   f. Slice to 1 → [room 96]
   g. Build holdPayload { hold_id, hotel_name, rooms, total_amount=60800 ... }
   h. Redis SET hold:uuid = payload  EX 600
   i. Redis SET room_held:96 = hold_id  EX 600
   j. Return { success, hold_id, total_amount: 60800 }
        ↓
5. FRONTEND redirects to payment page
   window.location.href = `/bookings/payment-page?hold_id=${data.hold_id}`
        ↓
6. CONTROLLER — paymentPage() [async]
   Calls bookingService.getHold(hold_id)
   → Redis returns full holdPayload + secondsLeft
   res.render("booking/payment", { hold_id, holdData })
        ↓
7. PAYMENT PAGE LOADS — fully populated immediately
   EJS injects holdData into the page JavaScript:
     const HOLD_DATA = { hotel_name, rooms, total_amount, expires_in_seconds ... }
   populateSummary() → fills in all summary fields
   startCountdown(secondsLeft) → timer starts from actual remaining time
        ↓
8. USER FILLS PAYMENT DETAILS + CLICKS PAY
   validate() → checks card number / UPI
   processPayment() → shows spinner, simulates 2.5s processing
        ↓
9. FRONTEND calls POST /bookings/confirm
   Body: { hold_id: "f59361f3...", payment_method_id: 2 }
        ↓
10. CONTROLLER — confirmBooking()
    ✓ hold_id present
    → calls bookingService.confirmBooking()
        ↓
11. SERVICE — confirmBooking()
    Step 1: Redis GET hold:uuid → hold payload (throws if expired)
    Step 2: getRoomsHeldByOthers(hold_id) → verify no conflicts
    Step 3: db.getConnection() + beginTransaction()
    Step 4: createBooking()     → INSERT bookings        → bookingId = 881
    Step 5: createBookingRooms()→ INSERT booking_rooms   (rate snapshot)
    Step 6: createPayment()     → INSERT payments PENDING
    Step 7: connection.commit() → all 3 inserts permanent
    Step 8: Redis DEL hold:uuid
            Redis DEL room_held:96
    Return: { success, booking_id: 881, booking_reference: "HBMS-A3X9K2" }
        ↓
12. FRONTEND calls POST /bookings/payment-success
    Body: { booking_id: 881 }
    → UPDATE payments SET payment_status_id=2, paid_at=NOW()
        ↓
13. FRONTEND shows success screen
    "Booking Confirmed! HBMS-A3X9K2"
    Button: "View Booking" → /bookings/my
```

---

## 7. Redis Key Map

| Key Pattern | Value | TTL | Purpose |
|-------------|-------|-----|---------|
| `hold:{uuid}` | JSON holdPayload | 600s | Full hold data for payment page + confirm |
| `room_held:{room_id}` | hold_id string | 600s | Room lock — prevents other users booking same room |

**What happens when TTL expires (user abandons payment):**

Both keys delete themselves. The next user calling `getRoomsHeldByOthers()` won't see this room anymore. `getAvailableRooms()` will include it again. No cleanup job, no cron, no manual intervention needed.

The booking was never written to MySQL (that only happens in `confirmBooking`), so there is nothing to roll back in the database either.

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
  booking_id:        881
  hotel_id:          10
  user_id:           22
  booking_status_id: 2          (CONFIRMED)
  booking_source_id: 1          (ONLINE)
  booking_reference: "HBMS-A3X9K2"
  checkin_date:      "2026-06-11"
  checkout_date:     "2026-06-30"
  total_amount:      60800.00

booking_rooms table:
  booking_room_id:  1204
  booking_id:       881
  room_id:          96
  rate_per_night:   3200.00    ← price snapshot at time of booking

payments table:
  hotel_id:          10
  booking_id:        881
  payment_method_id: 2          (CARD)
  payment_status_id: 1          (PENDING)
  amount:            60800.00
  paid_at:           NULL
```

### After `markPaymentSuccess`:
```
payments table:
  payment_status_id: 2          (SUCCESS)
  paid_at:           "2026-06-11 10:30:45"
```

---

## 9. Error Handling Map

| Where it happens | Condition | What the user sees |
|-----------------|-----------|-------------------|
| `calcNights` | checkout ≤ checkin | 400 — "Check-out must be after check-in" |
| `holdBooking` | Not enough rooms of a type | 400 — "Only X room(s) available for Y" |
| `holdBooking` | No rooms selected | 400 — "No rooms selected" |
| `holdBooking` | hotel_id doesn't exist | `hotel_name` defaults to `""` — no crash |
| `getHold` | Hold expired or bad ID | 404 OR redirect to `/` |
| `confirmBooking` | Hold expired (10 min passed) | 400 — "Hold expired. Please start again" |
| `confirmBooking` | Room conflict on re-verify | 400 — "Rooms no longer available" |
| `confirmBooking` | DB error inside transaction | Rollback — no partial data, hold stays alive |
| `paymentPage` | No `hold_id` in URL | Redirect to `/` |
| `paymentPage` | Hold expired at render time | Redirect to `/` |
| `holdBooking` | User not logged in | 401 — "Login required" |

---

*End of Booking Module Documentation (v2)*