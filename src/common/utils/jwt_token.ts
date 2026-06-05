import jwt from "jsonwebtoken";

export const generateToken = (
    userId: number,
    roleId: number
): string => {

    return jwt.sign(
        {
            userId,
            roleId
        },
        process.env.JWT_SECRET!,
        {
            expiresIn: "1d"
        }
    );
};

export const verifyToken = (
    token: string
) => {
    return jwt.verify(
        token,
        process.env.JWT_SECRET!
    );
};

export const storeToken = (
    token: string,
    res: any
) => {
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict"
    });
}