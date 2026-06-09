import { Request,Response } from "express";
import { getJwtTokenValue } from "../../../common/utils/getRequestVariables";
import * as guestServices from "../services/guestServices";

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