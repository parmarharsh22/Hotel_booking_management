import * as authModel from "../models/authModel";
import { generateToken } from "../../../common/utils/jwt_token";
import bcrypt from "bcryptjs";

//check for duplicate email in the db
export const checkEmail = async (email: string) => {
    const user = await authModel.findByEmail(email);
    return !!user;
};

//register the user
export const registerUser = async (body: any, file: any) => {
    const { firstName, lastName, email, phone, state, city, password } = body;
    const hashedPass = await bcrypt.hash(password,10);
    const filename = file;
    await authModel.insertUser(firstName, lastName, email, phone, state, city, hashedPass,filename);
}

//login a user
export const loginUser = async(role:string,email: string,password:string) =>{
    const result = await authModel.logon(email);
    if(!result){
        throw new Error("Invalid Credentials!");
    }
    if(result.role_name !== role){
        throw new Error("Invalid Role Selected!"); 
    }
    const passmatch = await bcrypt.compare(password,result.password_hash)
    if(!passmatch){
        throw new Error("Invalid Credentials!");
    }
    const token = generateToken(result.user_id,result.user_role_id);
    return{
        token:token}
}

//Render all the locations
export const getAllLocations = async() =>{
    const locations = authModel.getAllLocations()
    if(!locations){
        throw new Error("City loading failed");
    }
    return locations;
}
