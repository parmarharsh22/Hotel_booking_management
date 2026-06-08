// Never redirect or force to login if the login is there it's okay else also okayy

import { Request,Response,NextFunction } from "express";
import { verifyToken } from "../../utils/jwt_token";
export const attachUser = (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    try {

        const token = req.cookies?.token;
        if (token) {
            res.locals.user = verifyToken(token);
        } else {
            res.locals.user = null;
        }
    } catch {
        res.locals.user = null;
    }
    next();
};