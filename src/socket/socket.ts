import { Server } from "socket.io";

let io: Server;

export const initializeSocket = (server: any) => {

    io = new Server(server, {
        cors: {
            origin: "*",
        },
    });

    io.on("connection", (socket) => {

        // client joins its hotel room so it only receives events for that hotel
        socket.on("joinHotel", (hotelId: number) => {
            socket.join(`hotel_${hotelId}`);
        });

    });

};

export const getIo = (): Server => {

    if (!io) {
        throw new Error("socket.io not initialized");
    }

    return io;

};