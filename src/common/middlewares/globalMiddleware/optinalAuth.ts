import { Request, Response, NextFunction } from "express";
import { JwtPayload } from "jsonwebtoken";
import { verifyToken } from "../../utils/jwt_token";

export interface UserTokenPayload extends JwtPayload {
    userId: number;
    hotel_id?: string;
    roleId: string;
}

export const attachUser = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const token = req.cookies?.token;

        if (!token) {
            res.locals.user = null;
            return next();
        }

        const user = verifyToken(token) as UserTokenPayload;

        if (!user) {
            res.locals.user = null;
            return next();
        }
        res.locals.user = user;

    } catch {
        res.locals.user = null;
    }

    next();
};