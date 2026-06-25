import express from "express";
import * as authController from "../controller/authController";
import { uploadProfilePhoto } from "../../../common/middlewares/multer";
import { verifyCaptchaMiddleware } from "../../../common/middlewares/verifyCaptcha";
import { checkResetPasswordSession } from "../../../common/middlewares/checkPasswordSession";
const authRouter = express.Router();

//Render the mainPage or indexPage
authRouter.get("/",authController.showMainPage);

//Render the loginPage
authRouter.get("/login",authController.showLoginPage);

//Render the registrationPage
authRouter.get("/register",authController.showRegistrationPage);

//Register New GUEST
authRouter.post("/register",uploadProfilePhoto.single("photo"),verifyCaptchaMiddleware("/register"),authController.registerUser);

//check for EmailUniqueness
authRouter.post("/checkEmail",authController.checkEmailUniq)

//login a user
authRouter.post("/loginUser",verifyCaptchaMiddleware("/login"),authController.loginUser);

//getAlltheLocations
authRouter.get("/getLocations",authController.getAllLocations);

//forgetPassword Request {render}
authRouter.get("/forgetPassword",authController.forgetPassword);

//setSession and generateOtp
authRouter.post("/emailSim",authController.setResetPassSession);

//redirection from emailSimPage
authRouter.get("/resetPassword",checkResetPasswordSession,authController.showPasswordResetPage);

//validate Otp function
authRouter.post("/checkOtp",checkResetPasswordSession,authController.validateOtp)

//resetPassword
authRouter.post("/resetPassword",checkResetPasswordSession,authController.updatePassword);

authRouter.get("/legal", (req, res) => {
  res.render("legal", { user: res.locals.user || null });
});

export default authRouter;