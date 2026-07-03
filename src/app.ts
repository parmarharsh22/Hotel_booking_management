import express from "express";
import path from "path";
import authRouter from "./modules/auth/routes/authroute";
import { sessionMiddleware } from "./config/sessionMiddleware";
import cors from "cors"
import superadminRoutes from "./modules/superAdmin/superadmin.routes";
import { attachUser } from "./common/middlewares/globalMiddleware/optinalAuth";
import authenRoute from "./modules/Authen_Guest/router/guestRoutes";
import cookie from "cookie-parser";
import roomRouter from "./modules/room/routes/roomRoute";
import hotelAdminRoutes from "./modules/hotelAdmin/hotelAdmin.routes";
import BookingRoutes from "./modules/booking/routes/booking.routes";
import frontDeskRouter from "./modules/FrontDesk/routes/frontDeskRoutes";
import invoice from "./modules/invoices/invoiceMain.routes";
import { startDirtyRoomWorker } from "./modules/FrontDesk/workers/dirtyRoomWorker";
import BookingModificationRoutes from './modules/Booking_Cancellation_Modification/Routes/bookingRoutes.routes'
import CancellationRoutes from './modules/Booking_Cancellation_Modification/Routes/bookingCancellation.routes'
const app = express();

app.use(
    cors({
        origin: process.env.CLIENT_ORIGIN?.split(",") ?? ["http://localhost:5173"],
        credentials: true,
    })
);


//cookie
app.use(cookie());

//global authentication (optinal Login)
app.use(attachUser);

//session
app.use(sessionMiddleware);


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

startDirtyRoomWorker();
//url routes

//protected Routes
app.use("/authen",authenRoute);
app.use("/superadmin", superadminRoutes);
app.use("/hotelAdmin",hotelAdminRoutes);
app.use("/bookings", BookingRoutes)
app.use("/frontDesk",frontDeskRouter);
app.use("/invoices",invoice);

//All the unproctedRoutes
app.use("/",authRouter);
app.use('/rooms',roomRouter);
app.use("/mybookings",BookingModificationRoutes)
app.use("/mybookings" ,CancellationRoutes )

export default app;