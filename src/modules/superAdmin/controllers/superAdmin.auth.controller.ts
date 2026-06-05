import { Request, Response } from "express";
import { SuperAdminService } from "../services/superAdmin.auth.service";
import { comparePassword, hashedPassword } from "../../../common/utils/hashPassword";
import { assignJWT } from "../../../common/utils/jsonSign";
import bcrypt from "bcrypt";

const superAdminSerive = new SuperAdminService();

export class SuperAdminController {

    async loginPage(req:Request, res:Response){
        res.render("superAdmin/login");
    }

    async login(req: Request, res: Response) {
        try {
            const data = req.body;
            console.log(data);
            const email = data.email;
            const plainPass = data.password_hash;

            const superAdminData: any = await superAdminSerive.findByEmail(email);
            console.log(superAdminData);

            // const hash = await hashedPassword(plainPass);
            // console.log(hash);
            console.log("comparing now")
            const compare = await comparePassword(superAdminData.password_hash, plainPass);
            const token = await assignJWT(email, superAdminData.user_id);
            console.log(token);
            if (compare) {
                return res.status(200).json({
                    message: "success",
                    token: token
                });
            }

            res.status(400).json("Password is Incorrect");
        }
        catch (err: any) {
            res.status(400).json(err.message);
        }
    }



}
