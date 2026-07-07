import { Request,Response,NextFunction} from "express";

export const checkResetPasswordSession = (req:Request,res:Response,next:NextFunction)=>{
    if(!(req.session as any).email){
        (req.session as any).failureMessage = "Invalid request no email founded!";
        return res.status(500).json({message:"No valid OTP SESSION FOUNDED!"})
    }
    next();
} 