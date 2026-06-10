import dotenv from "dotenv";
dotenv.config();

import app from "./app";

const PORT = process.env.PORTNU || 7777;

app.listen(PORT, () => {
    console.log("DB connecting as:", process.env.DB_USER, "to", process.env.DB_HOST);
    console.log(`Server running on http://localhost:${PORT}`);
});