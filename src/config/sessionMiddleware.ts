import session  from "express-session";

export const sessionMiddleware = session({
    secret: process.env.SESSION_KEY || 'NOTHING',
    resave:false,
    saveUninitialized:false
}) 