import { Request,Response } from "express";
import { getJwtTokenValue } from "../../../common/utils/getRequestVariables";
import * as guestServices from "../services/guestServices";
import { deleteOldPhoto } from "../../../common/utils/deleteOldProfilePic";

//Get the user details
export const getUserDetails = async(req:Request,res:Response) =>{
    try{
        const id = getJwtTokenValue("userId",req);
        const data = await guestServices.getUserData(id);
        return res.status(200).send(data);
    }catch(err: any){
        return res.status(500).send(err.message);
    }
}

//Update the user Profile
export const updateProfile = async(req:Request,res:Response)=>{
    try{
        const id = getJwtTokenValue("userId",req);
        const data = await guestServices.getUserData(id);
        
        await guestServices.updateUser(id,req);
        
        //remove old photo
        if(req.file?.filename){
            deleteOldPhoto(data.photo_url);
        }
        
        (req.session as any).profileEdited = "Profile Updated successfully!"
        res.redirect("/");
    }catch(err:any){
        return res.status(500).send(err.message);
    }
}

//logout a user
export const logoutUser = async(req:Request,res:Response)=>{
    res.clearCookie("token");
    return res.redirect("/");
}