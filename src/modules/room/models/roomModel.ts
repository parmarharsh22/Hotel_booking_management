import { db } from "../../../config/db";
import { PoolConnection, RowDataPacket } from "mysql2/promise";
import { RoomRow } from "../interfaces/room.availableRoomsRow.interface";
import { RoomTypeRow } from "../interfaces/room.RoomTypeRow.interface";
import { AmenityTypes } from "../interfaces/room.AmenityTypes.inaterface";

export const searchHotels = async (
    location: string,
    checkIn: string,
    checkOut: string,
    priceFilter: number | undefined,
    roomTypesFilter: string[] | undefined,
    amenitiesFilter: string[] | undefined
) => {
    // Core parameters matched to the base WHERE clause placeholders
    const paramsArray = [location, checkOut, checkIn, checkOut, checkIn];

    let priceSqlBlock = '';
    let roomTypeSqlBlock = '';
    let amenitiesFilterSqlBlock = '';
    let havingSqlBlock = '';

    if (priceFilter !== undefined) {
        priceSqlBlock += ' AND rt.base_price <= ?';
        paramsArray.push(priceFilter.toString());
    }

    if (roomTypesFilter !== undefined && roomTypesFilter.length > 0) {
        roomTypeSqlBlock += ` AND rt.type_name IN (${roomTypesFilter.map(() => '?').join(', ')})`;
        roomTypesFilter.forEach(val => {
            paramsArray.push(val);
        });
    }

    // Cleaned up filter: Inject only the WHERE constraint here
    if (amenitiesFilter !== undefined && amenitiesFilter.length > 0) {
        amenitiesFilterSqlBlock += ` AND rte.amenity_id IN (${amenitiesFilter.map(() => '?').join(', ')})`;
        amenitiesFilter.forEach(val => {
            paramsArray.push(val);
        });
        
        // Push HAVING logic to its own block evaluated after GROUP BY
        havingSqlBlock += ' HAVING COUNT(DISTINCT rte.amenity_id) = ?';
        paramsArray.push(amenitiesFilter.length.toString());
    }

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
    ON r.room_type_id = rt.room_type_id AND r.hotel_id=h.hotel_id
${amenitiesFilter?.length ? 'JOIN room_type_amenities rte ON rt.room_type_id = rte.room_type_id' : ''}
WHERE
    h.tenant_status_id = 1 
    AND (
        LOWER(h.city) LIKE LOWER(CONCAT('%', ?, '%'))
       
    )
    AND r.room_status_id = 1
    AND r.room_id NOT IN (
        SELECT br.room_id
        FROM booking_rooms br
        JOIN bookings b ON b.booking_id = br.booking_id
        WHERE b.booking_status_id IN (1,2,3)
          AND b.checkin_date < ?
          AND b.checkout_date > ?
    )
    AND r.room_id NOT IN (
        SELECT bh.room_id
        FROM booking_holds bh
        WHERE bh.expires_at > NOW()
          AND bh.checkin_date < ?
          AND bh.checkout_date > ?
    )
    ${priceSqlBlock}
    ${roomTypeSqlBlock}
    ${amenitiesFilterSqlBlock}

GROUP BY
    h.hotel_id,
    rt.room_type_id,
    r.room_id
${havingSqlBlock}
;`,
        paramsArray,
    );

    return rows;
};


export const hotelDetails = async (
    hotelId: number,
    checkIn: string,
    checkOut: string,
    priceFilter: number | undefined,
    roomTypesFilter: string[] | undefined,
    amenitiesFilter: string[] | undefined
) => {
    const paramsArray=[hotelId, checkOut, checkIn, checkOut, checkIn]
    let priceSqlBlock = '';
    let roomTypeSqlBlock = '';
    let amenitiesExistsSql = '';

    if (priceFilter !== undefined && !isNaN(priceFilter)) {
        priceSqlBlock += 'and rt.base_price<=?';
        paramsArray.push(priceFilter.toString());
    }

    if (roomTypesFilter !== undefined && roomTypesFilter.length > 0) {
        roomTypeSqlBlock += `and rt.type_name in (${roomTypesFilter.map(() => '?').join(', ')})`
        roomTypesFilter.forEach(val => {
            paramsArray.push(val);
        })
    }

    // Fixed: Appends to the main query's existing aggregates safely
    if (amenitiesFilter !== undefined && amenitiesFilter.length > 0) {
        amenitiesExistsSql = `
        AND (
            SELECT COUNT(DISTINCT rta2.amenity_id)
            FROM room_type_amenities rta2
            WHERE rta2.room_type_id = rt.room_type_id
            AND rta2.amenity_id IN (${amenitiesFilter.map(() => '?').join(', ')})
        ) = ?
    `;

    amenitiesFilter.forEach(val => paramsArray.push(val));

    paramsArray.push(amenitiesFilter.length);
    }
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
    ON r.room_type_id = rt.room_type_id AND r.hotel_id=h.hotel_id

LEFT JOIN room_type_amenities rta
    ON rta.room_type_id = rt.room_type_id

LEFT JOIN amenities a
    ON a.amenity_id = rta.amenity_id

WHERE
    h.hotel_id = ?
    AND h.tenant_status_id=1    
    AND r.room_status_id=1
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
    ${priceSqlBlock}
    ${roomTypeSqlBlock}
    ${amenitiesExistsSql}

GROUP BY
    h.hotel_id,
    rt.room_type_id

ORDER BY
    rt.base_price;
        `,
        paramsArray
    );

    return rows;
};


export const getAvailableRooms = async (connection: PoolConnection, hotelId: number, roomTypeId: number, checkIn: string, checkOut: string, quantity: number) => {
    const [rows] = await connection.query<RoomRow[]>(`
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
        `, [hotelId, roomTypeId, checkOut, checkIn, checkOut, checkIn, quantity]);

    return rows;
}

export const insertRoomHolds = async (
    connection: PoolConnection,

    rooms: RoomRow[],

    userId: number,

    checkIn: string,

    checkOut: string,

    adults: number,
    children: number
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

export const fetchFilterRoomTypes = async () => {
    const [rows] = await db.query<RoomTypeRow[]>('SELECT DISTINCT type_name FROM room_types ORDER BY type_name ASC');
  
    return rows;
}

export const fetchAmenities = async () => {
    const [rows] = await db.query<AmenityTypes[]>('SELECT amenity_id,amenity_name FROM amenities ORDER BY amenity_name ASC');
   
    return rows;
}