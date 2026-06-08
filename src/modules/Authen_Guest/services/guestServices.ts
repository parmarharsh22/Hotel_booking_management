import * as guestModel from "../models/guestModels";

export const getUserData = async(userId: string)=>{
    const data = await guestModel.getUserDetails(userId);
    if(!data){
        throw new Error("No such user exists");
    }
    return data;
}