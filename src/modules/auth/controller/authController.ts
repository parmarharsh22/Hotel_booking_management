import { Request, Response } from "express";
import * as authServices from "../services/authServices";

export const showMainPage = (req: Request, res: Response) => {
    res.render("index");
}

export const showLoginPage = (req: Request, res: Response) => {
    res.render("authFronted/login");
}

export const showRegistrationPage = (req: Request, res: Response) => {
    res.render("authFronted/register");
}

export const registerUser = async (req: Request, res: Response) => {
    try{
        await authServices.registerUser(req.body,req.file?.filename);
        res.redirect("/login");
    }catch(err: any){
        console.log("error",err);
    }
    
}

export const checkEmailUniq = async (req: Request,res: Response) => {
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