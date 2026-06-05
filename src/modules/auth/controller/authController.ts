import { Request, Response } from "express";
import * as authServices from "../services/authServices";
import { storeToken } from "../../../common/utils/jwt_token";

//Render the homePage
export const showMainPage = (req: Request, res: Response) => {
    const currentUser = res.locals.user;

    if(currentUser){
        return res.render("index",{welcome:" Welcome again !"});
    }
    return res.render("index",{welcome:""});
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
    res.render("authFronted/register", {
        recaptchaSiteKey: process.env.GOOGLE_SITE_KEY
    });
}

//Register a new user
export const registerUser = async (req: Request, res: Response) => {
    try {
        await authServices.registerUser(req.body, req.file?.filename);
        (req.session as any).successMessage = "Registration successful";
        res.redirect("/login");
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
export const loginUser = async (req: Request, res: Response) => {
    try{
        const {role,email,password} = req.body;
        const result = await authServices.loginUser(role,email,password);
        storeToken(result.token,res);
        res.redirect("/");
    }catch(err:any){
        (req.session as any).failureMessage = err.message;
        res.redirect("/login")
    }
}