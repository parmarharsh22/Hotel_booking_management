import { Server } from "socket.io";

let io: Server;

export const initializeSocket = (server: any) => {

    io = new Server(server, {
        cors: {
            origin: "*"
        }
    });

    io.on("connection", (socket) => {
        socket.on("joinHotel", (hotelId: number) => {
            socket.join(`hotel_${hotelId}`);
        });
        socket.on("disconnect", () => {
        });

    });

};

export const getIo = () => {

    if (!io) {
        throw new Error(
            "socket.io not initialized"
        );
    }

    return io;
};