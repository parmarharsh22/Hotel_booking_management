import { Request, Response } from "express";
import * as authServices from "../services/authServices";
import { storeToken } from "../../../common/utils/jwt_token";
import { redisClient } from "../../../config/pass_redis";
import * as roomService from "../../room/services/roomServices"; // ← adjust path to your roomServices
import { json } from "stream/consumers";

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
    const defaultCheckIn = tomorrow.toISOString().slice(0, 10);
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
        const { email } = req.body;
        const exists = await authServices.checkEmail(email);
        if (exists) {
            return res.status(404).json({ message: "User Exists with same email" });
        }
        await authServices.registerUser(req.body, req.file?.filename);
        (req.session as any).successMessage = "Registration successful";
        delete (req.session as any).successMessage;
        return res.status(200).send("User Registered!")
    } catch (err: any) {
        return res.status(401).json({ message: "Photo Size is to big keep it less than 5 MB" });
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
        return res.status(200).json({ userId: result.user_id, role: result.role, hotelId: result.hotel_id, });
    } catch (err: any) {
        return res.status(401).json({ message: err.message });
    }

}

//get All locations to render in the select dropDown
export const getAllLocations = async (req: Request, res: Response) => {
    try {
        const result = await authServices.getAllLocations();
        return res.status(200).send({ result });
    } catch (err: any) {
        (req.session as any).failureMessage = err.message;
        return res.status(401).json({ message: err.message });
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
    try {
        const { email } = req.body;
        // Check whether the email exists
        const exists = await authServices.checkEmail(email);

        if (!exists) {
            return res.status(404).json({
                success: false,
                message: "Email not found.",
            });
        }

        // Generate OTP
        const otp = Math.floor(1000 + Math.random() * 9000);

        await redisClient.set(
            `reset-password:${email}`,
            otp.toString(),
            { EX: 120 }
        );

        const ttl = await redisClient.ttl(`reset-password:${email}`);

        (req.session as any).email = email;
        (req.session as any).otp = otp;
        return res.status(200).json({
            success: true,
            message: "OTP generated successfully.",
            otp,
            email,
            ttl
        });

    } catch (err: any) {
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
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
export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { email, otp, password } = req.body;

        // 1. Verify OTP
        await authServices.checkOtp(Number(otp), email);

        // 2. Update password
        await authServices.updatePassword(email, password);

        // 3. Delete OTP from Redis so it can't be reused
        await redisClient.del(`reset-password:${email}`);

        return res.status(200).json({
            success: true,
            message: "Password reset successfully.",
        });

    } catch (err: any) {
        return res.status(400).json({ success: false, message: err.message });
    }
};

export const sendValidResponse = (req: Request, res: Response) => {
    res.status(200).json({
        userId: (req as any).user.userId,
        role: (req as any).user.roleId,  
        hotelId: (req as any).hotelId,
    });
}