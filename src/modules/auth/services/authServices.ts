import * as authModel from "../models/authModel";
import bcrypt from "bcryptjs";

//check for duplicate email in the db
export const checkEmail = async (email: string) => {
    const user = await authModel.findByEmail(email);
    return !!user;
};

//register the user
export const registerUser = async (body: any, file: any) => {
    const { firstName, lastName, email, phone, state, city, password } = body;
    console.log(body);
    console.log(file);
    const hashedPass = await bcrypt.hash(password,10);
    const filename = file;
    await authModel.insertUser(firstName, lastName, email, phone, state, city, hashedPass,filename);
}

