import express, { Request,Response } from "express";
import * as authController from "../controller/authController";
import { uploadProfilePhoto } from "../../../common/middlewares/multer";
const authRouter = express.Router();

//Render the mainPage or indexPage
authRouter.get("/",authController.showMainPage);

//Render the loginPage
authRouter.get("/login",authController.showLoginPage);

//Render the registrationPage
authRouter.get("/register",authController.showRegistrationPage);

//Register New GUEST
authRouter.post("/register",uploadProfilePhoto.single("photo"),authController.registerUser);

//check for EmailUniqueness
authRouter.post("/checkEmail",authController.checkEmailUniq)

export default authRouter;