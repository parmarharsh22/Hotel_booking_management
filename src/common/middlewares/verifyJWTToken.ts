import { NextFunction,Request,Response } from "express";
import {JwtPayload} from "jsonwebtoken"
import { verifyToken } from "../utils/jwt_token";

export interface UserTokenPayload extends JwtPayload {
    userId: number;
    hotel_id?: string;
    roleId: string;
}

export const validToken = async(
    req :Request,
    res : Response,
    next : NextFunction ) =>{
    try{
        const currentToken = req.cookies.token;
        const valid = verifyToken(currentToken) as UserTokenPayload;
        if(!valid){
            (req.session as any).failureMessage = "Invalid or expired Token detected!"
            res.clearCookie("token");
            return res.redirect("/login");
        }
        (req as any).user = valid;
        (req as any).hotelId = valid.hotel_id;
        next();
    }catch(err: any){
        (req.session as any).failureMessage = "Login_first"
        res.redirect("/login");
    }
}   