import { Request,Response } from "express"

//Display/Render EditProfile Page

export const showEditProfilePage = async(req:Request,res:Response)=>{
    res.render("authenticatedUsersFrontend/updateprofilepage")
}