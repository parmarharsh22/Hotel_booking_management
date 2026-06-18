import dotenv from "dotenv";
dotenv.config();

import http from "http";
import app from "./app";
import { initializeSocket } from "./socket/socket";

const PORT = process.env.PORTNU || 7777;

// create http server
const server = http.createServer(app);

// initialize socket.io
initializeSocket(server);

server.listen(PORT, () => {
    console.log(
        "DB connecting as:",
        process.env.DB_USER,
        "to",
        process.env.DB_HOST
    );

    console.log(
        `Server running on http://localhost:${PORT}`
    );
});