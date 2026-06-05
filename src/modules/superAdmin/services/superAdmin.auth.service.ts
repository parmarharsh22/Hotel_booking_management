import { error } from "node:console";
import { SuperAdminInterface } from "../models/superAdmin.auth.model";
import { SuperAdminModel } from "../models/superAdmin.auth.model";

export class SuperAdminService{
    async findByEmail(email:string):Promise<SuperAdminInterface>{
        try{
            if(!email){
                throw new Error("Email is required"); 
            }
            const data = await SuperAdminModel.findByEmail(email);
            return data;
        }
        catch(err){
            throw err;
        }
    }


}