import jwt from "jsonwebtoken"; 
import dotenv from "dotenv";

dotenv.config();

const SECRET_KEY:string = process.env.SECRET_KEY || "SECRETKEYFORTHEJWT@123";

export async function assignJWT(email:string,user_id : number){
    const token = jwt.sign(
        {email,user_id},
        SECRET_KEY,
        {expiresIn : "8h"}
    );
    return token;
}

export async function verifyJWT(token:string){
    try{
        const verify = jwt.verify(token,SECRET_KEY);
        return verify;
    }
    catch(err){
        throw new Error("invalid Credentials");
    }
}