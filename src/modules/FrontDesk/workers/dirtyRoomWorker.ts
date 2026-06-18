import { getIo } from "../../../socket/socket";
import {
    getAllDirtyRooms,
    dirtyRoomKey,
    markRoomAvailableInDb,
} from "../services/frontDeskServices";
import { redis } from "../../../config/redis";

// how often the worker polls
const POLL_INTERVAL_MS = 2 * 60 * 1000;

// single poll cycle — called on every interval tick
const runCleanupCycle = async (): Promise<void> => {

    // get every room currently sitting in dirty state in db
    const dirtyRooms = await getAllDirtyRooms();

    if (dirtyRooms.length === 0) return;

    // track which hotel ids get a status update so we emit once per hotel, not per room
    const updatedHotels = new Set<number>();

    for (const room of dirtyRooms) {

        const key = dirtyRoomKey(room.hotel_id, room.room_id);
        const value = await redis.get(key);

        // key still exists means the 15-min window hasn't passed yet — skip
        if (value === "DIRTY") continue;

        // key is gone — 15 min has passed, flip to available in db
        await markRoomAvailableInDb(room.room_id);

        updatedHotels.add(room.hotel_id);

        console.log(
            `[dirtyRoomWorker] room ${room.room_id} (hotel ${room.hotel_id}) marked available`
        );
    }

    // emit one socket event per affected hotel so dashboards refresh
    if (updatedHotels.size > 0) {
        const io = getIo();
        for (const hotelId of updatedHotels) {
            io.to(`hotel_${hotelId}`).emit("room_status_updated");
        }
    }
};

// start the worker — call this once at server startup
export const startDirtyRoomWorker = (): void => {

    console.log(
        `[dirtyRoomWorker] started — polling every ${POLL_INTERVAL_MS / 1000}s`
    );

    // run once immediately on startup to catch any rooms left dirty from a previous restart
    runCleanupCycle().catch((err) =>
        console.error("[dirtyRoomWorker] startup cycle error:", err)
    );

    setInterval(() => {
        runCleanupCycle().catch((err) =>
            console.error("[dirtyRoomWorker] cycle error:", err)
        );
    }, POLL_INTERVAL_MS);
};
