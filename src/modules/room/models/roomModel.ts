import { db } from "../../../config/db";

export const searchHotels=async( location:string,            
            check_in:string,          
            check_out:string,         
            guests:number,
            rooms:number )=>{
    const [rows]=await db.query(`SELECT
    h.hotel_id,
    h.name,
    h.city,
    h.state,
    h.country,
    MIN(rt.base_price) AS starting_price

FROM hotels h

JOIN room_types rt
    ON rt.hotel_id = h.hotel_id

JOIN rooms r
    ON r.room_type_id = rt.room_type_id

JOIN (
    SELECT
        ra.room_id
    FROM room_availability ra
    WHERE
        ra.availability_status_id = 1
        AND ra.date >= ?
        AND ra.date < ?
    GROUP BY ra.room_id
    HAVING COUNT(*) = DATEDIFF(?, ?)
) available_rooms
    ON available_rooms.room_id = r.room_id

WHERE
(
    LOWER(h.city) LIKE LOWER(CONCAT('%', ?, '%'))
    OR LOWER(h.state) LIKE LOWER(CONCAT('%', ?, '%'))
    OR LOWER(h.country) LIKE LOWER(CONCAT('%', ?, '%'))
)
AND rt.max_occupancy >= ?

GROUP BY
    h.hotel_id

HAVING
    COUNT(DISTINCT r.room_id) >= ?`,[
            location,          
            guests,            
            check_in,          
            check_out,         
            check_out,         
            check_in,          
            rooms              
        ]);

    console.log(rows);
}