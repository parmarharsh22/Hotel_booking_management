import { NextFunction,Request,Response } from "express";
import { verifyToken } from "../utils/jwt_token";

export const validToken = async(
    req :Request,
    res : Response,
    next : NextFunction
) =>{
    try{
        const currentToken = req.cookies.token;
        const valid = verifyToken(currentToken);
        if(!valid){
            (req.session as any).failureMessage = "Invalid or expired Token detected!"
            res.clearCookie("token");
            return res.redirect("/login");
        }
        (req as any).user = valid;
        next();
    }catch(err: any){
        (req.session as any).failureMessage = "Login_first"
        res.redirect("/login");
    }
}   