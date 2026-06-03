import { Request,Response } from "express";

export const showMainPage = (req:Request,res:Response)=>{
    res.render("index");
}

export const showLoginPage = (req:Request,res:Response)=>{
    res.render("authfrotend/login");
}