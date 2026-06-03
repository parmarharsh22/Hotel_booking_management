import express, { Request,Response } from "express";
import * as authController from "../controller/authController";
const authRouter = express.Router();

//Render the mainPage or indexPage
authRouter.get("/",authController.showMainPage);

<<<<<<< HEAD
//Render the loginPage
authRouter.get("/login",authController.showLoginPage);
=======
authRouter.get('/register',(req:Request,res:Response)=>{
    res.render('authfrotend/register')
})
>>>>>>> d2fd5a8be267c71b329d3d46483c8854a7e9360a

export default authRouter;