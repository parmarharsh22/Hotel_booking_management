import express from "express";
import path from "path";
import authRouter from "./modules/auth/routes/authroute";
import { sessionMiddleware } from "./config/sessionMiddleware";

import superadminRoutes from "./modules/superAdmin/superadmin.routes";
import { attachUser } from "./common/middlewares/globalMiddleware/optinalAuth";
import authenRoute from "./modules/Authen_Guest/router/guestRoutes";
import cookie from "cookie-parser";
import roomRouter from "./modules/room/routes/roomRoute";
import hotelAdminRoutes from "./modules/hotelAdmin/hotelAdmin.routes";
import frontDeskRouter from "./modules/FrontDesk/routes/frontDeskRoutes";
import invoice from "./modules/invoices/invoiceMain.routes";
import myBookings from "./modules/booking/routes/myBookings.router";

const app = express();

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

//url routes

//protected Routes
app.use("/authen",authenRoute);
app.use("/superadmin", superadminRoutes);
app.use("/hotelAdmin",hotelAdminRoutes);
app.use("/frontDesk",frontDeskRouter);
app.use("/invoices",invoice);
app.use("/myBookings",myBookings);

//All the unproctedRoutes
app.use("/",authRouter);
app.use('/rooms',roomRouter);


export default app;