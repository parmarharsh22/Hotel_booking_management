import express from "express";
import path from "path";
import authRouter from "./modules/auth/routes/authroute";
import superAdminAuthRouter from "./modules/superAdmin/routes/superAdmin.auth.routes";
import { sessionMiddleware } from "./config/sessionMiddleware";
const app = express();

//session
app.use(sessionMiddleware);


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());



//All the unproctedRoutes
app.use("/",authRouter);
app.use("/",superAdminAuthRouter);


export default app;