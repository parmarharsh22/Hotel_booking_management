import express, { Request,Response } from "express";
import * as authController from "../controller/authController";
const authRouter = express.Router();

//Render the mainPage or indexPage
authRouter.get("/",authController.showMainPage);

//Render the loginPage
authRouter.get("/login",authController.showLoginPage);

export default authRouter;