import express from "express";
import path from "path";
import authRouter from "./modules/auth/routes/authroute";
import { sessionMiddleware } from "./config/sessionMiddleware";
<<<<<<< HEAD

import superadminRoutes from "./modules/superAdmin/superadmin.routes";
import { attachUser } from "./common/middlewares/globalMiddleware/optinalAuth";
import authenRoute from "./modules/Authen_Guest/router/guestRoutes";
import cookie from "cookie-parser";
import roomRouter from "./modules/room/routes/roomRoute";
import { attachUser } from "./common/middlewares/globalMiddleware/optinalAuth";
import cookie from "cookie-parser";
=======
import superadminRoutes from "./modules/superAdmin/superadmin.routes";
import { attachUser } from "./common/middlewares/globalMiddleware/optinalAuth";
import cookie from "cookie-parser";
import roomRouter from "./modules/room/routes/roomRoute";
>>>>>>> 1f093e8f9c230d9ed9239476a67bf705902099c1
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
app.use("/superadmin", superadminRoutes);

<<<<<<< HEAD
//protected Routes
app.use("/authen",authenRoute);
=======
app.use("/superadmin", superadminRoutes);
>>>>>>> 1f093e8f9c230d9ed9239476a67bf705902099c1

//All the unproctedRoutes
app.use("/",authRouter);
app.use('/rooms',roomRouter);


export default app;