import express, { Request,Response } from "express";
const authRouter = express.Router();

authRouter.get("/",(req:Request,res:Response)=>{
    res.render("index");
});

authRouter.get('/register',(req:Request,res:Response)=>{
    res.render('authfrotend/register')
})

export default authRouter;