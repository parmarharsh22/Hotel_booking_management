import { Request,Response,NextFunction} from "express";

export const checkResetPasswordSession = (req:Request,res:Response,next:NextFunction)=>{
    if(!(req.session as any).email){
        (req.session as any).failureMessage = "Invalid request no email founded!";
        return res.redirect("/forgetPassword");
    }
    next();
} 