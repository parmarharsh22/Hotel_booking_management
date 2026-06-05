import express from "express";
import path from "path";
import authRouter from "./modules/auth/routes/authroute";
import { sessionMiddleware } from "./config/sessionMiddleware";
import superadminRoutes from "./modules/superAdmin/superadmin.routes";
import { attachUser } from "./common/middlewares/globalMiddleware/optinalAuth";
import cookie from "cookie-parser";
import roomRouter from "./modules/room/routes/roomRoute";
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


app.use("/superadmin", superadminRoutes);

//All the unproctedRoutes
app.use("/",authRouter);
app.use('/rooms',roomRouter);


export default app;