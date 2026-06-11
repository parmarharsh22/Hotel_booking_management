import { db } from "../../../config/db";
import { PoolConnection,RowDataPacket } from "mysql2/promise";
import { RoomRow } from "../interfaces/room.availableRoomsRow.interface";

export const searchHotels = async (
  location: string,
  check_in: string,
  check_out: string,
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
h.tenant_status_id=1 and
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
)
   AND r.room_id NOT IN
            (
                SELECT bh.room_id

                FROM booking_holds bh

                WHERE
                    bh.expires_at > NOW()

                    AND bh.checkin_date < ?
                    AND bh.checkout_date > ?
            )
;`,
    [location, location, location, check_out, check_in,check_out, check_in],
  );
  // console.log('62',rows);
  return rows;
};

export const hotelDetails = async (
  hotelId: number,
  check_in: string,
  check_out: string,
) => {
  const [rows] = await db.query<RowDataPacket[]>(
    `
        SELECT
    h.hotel_id,
    h.name,
    h.address,
    h.city,
    h.state,
    h.country,
    h.phone,
    h.email,
    h.logo_url,
    h.cover_url,

    rt.room_type_id,
    rt.type_name,
    rt.photo_url,
    rt.description,
    rt.base_price,
    rt.max_adults,
    rt.max_children,

    COUNT(DISTINCT r.room_id) AS available_rooms,

    GROUP_CONCAT(
        DISTINCT a.amenity_name
        ORDER BY a.amenity_name
        SEPARATOR ', '
    ) AS amenities

FROM hotels h

JOIN room_types rt
    ON rt.hotel_id = h.hotel_id

JOIN rooms r
    ON r.room_type_id = rt.room_type_id

LEFT JOIN room_type_amenities rta
    ON rta.room_type_id = rt.room_type_id

LEFT JOIN amenities a
    ON a.amenity_id = rta.amenity_id

WHERE
    h.hotel_id = ?
    AND h.tenant_status_id=1

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
    ) AND r.room_id NOT IN
            (
                SELECT bh.room_id

                FROM booking_holds bh

                WHERE
                    bh.expires_at > NOW()

                    AND bh.checkin_date < ?
                    AND bh.checkout_date > ?
            )

GROUP BY
    h.hotel_id,
    rt.room_type_id

HAVING
    available_rooms > 0

ORDER BY
    rt.base_price;
        `,
    [hotelId, check_out, check_in,check_out, check_in],
  );

  return rows;
};


export const getAvailableRooms=async(  connection:PoolConnection,hotelId:number,roomTypeId:number,checkIn:string,checkOut:string,quantity:number)=>{
    const [rows]=await connection.query<RoomRow[]>(`
         SELECT
            r.room_id

        FROM rooms r

        WHERE
            r.hotel_id = ?

            AND r.room_type_id = ?

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
            )

            AND r.room_id NOT IN
            (
                SELECT bh.room_id

                FROM booking_holds bh

                WHERE
                    bh.expires_at > NOW()

                    AND bh.checkin_date < ?
                    AND bh.checkout_date > ?
            )

        LIMIT ?
        `,[hotelId,roomTypeId,checkOut,checkIn,checkOut,checkIn,quantity]);

        return rows;
}

export const insertRoomHolds = async (
    connection:PoolConnection,

    rooms:RoomRow[],

    userId:number,

    checkIn:string,

    checkOut:string,

    adults:number,
    children:number
) => {

    for (const room of rooms) {

        await connection.query(
            `
            INSERT INTO booking_holds
            (
                room_id,

                user_id,

                adults,

                children,

                checkin_date,

                checkout_date,

                expires_at
            )

            VALUES
            (
                ?,
                ?,
                ?,

                ?,

                ?,

                ?,

                DATE_ADD(NOW(), INTERVAL 10 MINUTE)
            )
            `,
            [
                room.room_id,

                userId,

                adults,

                children,

                checkIn,

                checkOut
            ]
        );

    }
};