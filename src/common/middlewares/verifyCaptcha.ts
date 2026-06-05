import { Request, Response, NextFunction } from "express";
import { verifyRecaptcha } from "../utils/recaptcha";

export const verifyCaptchaMiddleware = (location: string) => {
    return async (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {

        const token =
            req.body["g-recaptcha-response"];

        const isValid =
            await verifyRecaptcha(token);

        if (!isValid) {

            (req.session as any).failureMessage = "Captcha verification failed";
            return res.redirect(location);
        }

        next();
    };
}