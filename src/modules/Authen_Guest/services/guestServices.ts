import * as guestModel from "../models/guestModels";

//get user data from the db
export const getUserData = async(userId: string)=>{
    const data = await guestModel.getUserDetails(userId);
    if(!data){
        throw new Error("No such user exists");
    }
    return data;
}

//update the user data
export const updateUser = async(userId: string,req:any)=>{
    if(!userId){
        throw new Error("Invalid Id specified");
    }
    const fileName = req.file?.filename;
    const {first_name,last_name,phone,dob,gender,address,city,state}= req.body
    const user_id = userId;
    await guestModel.updateUserDetails(userId,first_name,last_name,phone,dob,gender,address,city,state,fileName);
}