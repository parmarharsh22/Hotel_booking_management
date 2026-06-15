import * as authModel from "../models/authModel";
import { generateToken } from "../../../common/utils/jwt_token";
import { redisClient } from "../../../config/pass_redis";
import bcrypt from "bcryptjs";

//check for duplicate email in the db
export const checkEmail = async (email: string) => {
    const user = await authModel.findByEmail(email);
    return !!user;
};

//register the user
export const registerUser = async (body: any, file: any) => {
    const { firstName, lastName, email, phone, state, city, password, gender, address, dob } = body;
    const hashedPass = await bcrypt.hash(password, 10);
    const filename = file;
    await authModel.insertUser(firstName, lastName, email, phone, state, city, hashedPass, filename, gender, address, dob);
}

//login a user
export const loginUser = async (role: string, email: string, password: string) => {
    const result = await authModel.logon(email);
    if (!result) {
        throw new Error("Invalid Credentials!");
    }
    if (result.role_name !== role) {
        throw new Error("Invalid Role Selected!");
    }
    const passmatch = await bcrypt.compare(password, result.password_hash)
    if (!passmatch) {
        throw new Error("Invalid Credentials!");
    }
    const token = generateToken(result.user_id, result.role_name, result.hotel_id);
    return { token: token }
}

//Render all the locations
export const getAllLocations = async () => {
    const locations = authModel.getAllLocations()
    if (!locations) {
        throw new Error("City loading failed");
    }
    return locations;
}

//return whether the Otp is true or correct or not
export const checkOtp = async (userOtp: number,email:string) => {
    const otp: unknown = await redisClient.get(`reset-password:${email}`);
    if(!otp || typeof(otp) == null){
        throw new Error("No valid otp founded")
    }
    if(userOtp == otp){
       return true
    }
    else{
        throw new Error("Invalid or expired OTP");
    }
}


//update the password
export const updatePassword = async(email:string,password:string)=>{
    //remove the credentials
    await redisClient.del(`reset-password:${email}`);
    //convert into hashedPass
    const hashedPass = await bcrypt.hash(password,10);

    const result = await authModel.updatePass(email,hashedPass);
    if(!result){
        throw new Error("DB Error occured!");
    }
}