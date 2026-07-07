import { NextFunction, Request, Response } from "express";

export const allowRoles = (...allowedRoles: string[]) => {
    return (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const user = (req as any).user;
        // check if user data exists
        if (!user) {
            (req.session as any).failureMessage = "Login first";
            return res.status(404).json({message: "Login First"});
        }
        
        // check if user has required role
        if (!allowedRoles.includes(user.roleId)){
            res.clearCookie("token");
            console.log("called Update");
            
            (req.session as any).failureMessage ="You are not authorized to access this page";
            return res.status(404).json({message: "You are not authorized to access this page"});
        }
        
        next();
    };
};