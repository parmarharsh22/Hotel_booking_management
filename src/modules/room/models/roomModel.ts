import { RowDataPacket } from "mysql2";
import { db } from "../../../config/db";

export const searchHotels = async (
  location: string,
  check_in: string,
  check_out: string,
  rooms: number,
  adults: number,
  child?: number,
) => {
  const [rows] = await db.query<RowDataPacket[]>(
    `
SELECT
    h.hotel_id,
    h.name,
    h.city,
    h.state,
    h.country,

    rt.room_type_id,
    rt.type_name,
    rt.base_price,

    rt.max_adults,
    rt.max_children,

    r.room_id

FROM hotels h

JOIN room_types rt
    ON rt.hotel_id = h.hotel_id

JOIN rooms r
    ON r.room_type_id = rt.room_type_id

WHERE
(
    LOWER(h.city) LIKE LOWER(CONCAT('%', ?, '%'))
    OR LOWER(h.state) LIKE LOWER(CONCAT('%', ?, '%'))
    OR LOWER(h.country) LIKE LOWER(CONCAT('%', ?, '%'))
)

AND r.room_id NOT IN
(
    SELECT br.room_id

    FROM booking_rooms br

    JOIN bookings b
        ON b.booking_id = br.booking_id

    WHERE
        b.booking_status_id IN (1,2,3)

        AND b.checkin_date < ?
        AND b.checkout_date > ?
);`,
    [location, location, location, check_out, check_in],
  );
// console.log('62',rows);
  return rows;
};
