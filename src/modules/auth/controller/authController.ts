import { Request, Response } from "express";
import * as authServices from "../services/authServices";
import { storeToken } from "../../../common/utils/jwt_token";
import { redisClient } from "../../../config/pass_redis";
import * as roomService from "../../room/services/roomServices"; // ← adjust path to your roomServices

interface LoginBody {
    role: "ADMIN" | "FRONT_DESK" | "GUEST";
    email: string;
    password: string;
}

interface RegisterBody {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    state: string;
    city: string;
    dob: string;
    gender: "Male" | "Female" | "Other";
    photo?: string;
    address: string;
    password: string;
    confirmPassword: string;
    terms: string;
    "g-recaptcha-response"?: string;
}


export const showMainPage = async (req: Request, res: Response) => {
    const currentUser = res.locals.user;

    //get the sessionFlash message and delte the session
    const profileEdited = (req.session as any).profileEdited;
    delete (req.session as any).profileEdited;

    if (currentUser?.roleId === "ADMIN") {
        return res.redirect("/hotelAdmin/rooms");
    }

    if (currentUser?.roleId === "FRONT_DESK") {
        return res.redirect("/frontDesk/home");
    }

    // featured hotels + default booking dates (tomorrow → day after)
    const featuredHotels = await roomService.getFeaturedHotels();

    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(); dayAfter.setDate(dayAfter.getDate() + 2);
    const defaultCheckIn  = tomorrow.toISOString().slice(0, 10);
    const defaultCheckOut = dayAfter.toISOString().slice(0, 10);

    if (currentUser?.roleId === "GUEST") {
        return res.render("index", {
            welcome: " Welcome again !",
            edited: profileEdited,
            featuredHotels,
            defaultCheckIn,
            defaultCheckOut,
        });
    }

    return res.render("index", {
        welcome: "",
        edited: "",
        featuredHotels,
        defaultCheckIn,
        defaultCheckOut,
    });
}

//Render the login page
export const showLoginPage = (req: Request, res: Response) => {
    const successMessage = (req.session as any).successMessage;
    const failure = (req.session as any).failureMessage;

    delete (req.session as any).successMessage;
    delete (req.session as any).failureMessage;

    res.render("authFronted/login", {
        successMessage, failure,
        recaptchaSiteKey: process.env.GOOGLE_SITE_KEY
    });
};

//Render the registration page
export const showRegistrationPage = (req: Request, res: Response) => {
    const failure = (req.session as any).failureMessage;
    delete (req.session as any).failureMessage;
    res.render("authFronted/register", {
        recaptchaSiteKey: process.env.GOOGLE_SITE_KEY
    });
}

//Register a new user
export const registerUser = async (req: Request<{}, {}, RegisterBody>, res: Response) => {
    try {
        await authServices.registerUser(req.body, req.file?.filename);
        (req.session as any).successMessage = "Registration successful";
        delete (req.session as any).successMessage;
        return res.redirect("/login");
    } catch (err: any) {
        console.log("error", err);
    }
}

//check for the email in the DB if exists then error 
export const checkEmailUniq = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        const exists = await authServices.checkEmail(email);
        return res.status(200).json({
            exists
        });
    } catch (err: any) {
        console.error(err);
        return res.status(500).json({
            exists: false,
            message: err.message
        });
    }
};

//login a user
export const loginUser = async (req: Request<{}, {}, LoginBody>, res: Response) => {
    try {
        const { role, email, password } = req.body;
        const result = await authServices.loginUser(role, email, password);
        storeToken(result.token, res);
        if (role === "ADMIN") {
            return res.redirect("/hotelAdmin/rooms")
        }
        else if (role === "FRONT_DESK") {
            return res.redirect("/frontDesk/home");
        }
        else {
            return res.redirect("/");
        }
    } catch (err: any) {
        (req.session as any).failureMessage = err.message;
        return res.redirect("/login")
    }

}

//get All locations to render in the select dropDown
export const getAllLocations = async (req: Request, res: Response) => {
    try {
        const result = await authServices.getAllLocations();
        return res.status(200).send({ result });
    } catch (err: any) {
        (req.session as any).failureMessage = err.message;
        return res.redirect("/");
    }
}

//render the forget Password page
export const forgetPassword = (req: Request, res: Response) => {
    const error = (req.session as any).failureMessage;
    delete (req.session as any).failureMessage;

    res.render("authFronted/forgetPass/forgetPass", { error: error });
}

//set the reset password session and generate the otp
export const setResetPassSession = async (req: Request, res: Response) => {
    const email = req.body.email;

    //random 4 digit otp
    const otp = Math.floor(1000 + Math.random() * 9000);

    //2 min valid otp
    await redisClient.set(`reset-password:${email}`, otp.toString(), { EX: 120 });

    //sessionSet
    (req.session as any).email = email;

    res.render("authFronted/forgetPass/emailSimulation", { otp, currentemail: email });
};

//render the password reset page
export const showPasswordResetPage = async (req: Request, res: Response) => {
    const email = (req.session as any).email;
    const ttl = await redisClient.ttl(`reset-password:${email}`);
    res.render("authFronted/forgetPass/resetPassword.ejs", { email: email, ttl });
}

//validate the otp give from the reset_pass
export const validateOtp = async (req: Request, res: Response) => {
    try {
        const email: string = (req.session as any).email;
        const userOtp: number = req.body.otp
        const result = await authServices.checkOtp(userOtp, email)
        return res.status(200).send("valid OTP");
    } catch (err: any) {
        return res.status(500).send(err.message);
    }
}

//Update the password 
export const updatePassword = async (req:Request,res:Response)=>{
    try{
        const{email,password} = req.body;
        delete (req.session as any).email;
        await authServices.updatePassword(email,password);
        (req.session as any).successMessage = "Password Reset Successfull"
        res.redirect("/login");
    }catch(err:any){
        (req.session as any).failureMessage = err.message;
        return res.redirect("/forgetPassword");
    }
}