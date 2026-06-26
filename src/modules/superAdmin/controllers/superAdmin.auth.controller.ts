import { Request, Response } from "express";
import {
  comparePassword,
  hashedPassword,
} from "../../../common/utils/hashPassword";
import { assignJWT } from "../../../common/utils/jsonSign";
import jwt from "jsonwebtoken";

import bcrypt from "bcrypt";
import { SuperAdminService } from "../services/superAdmin.auth.service";
import { storeToken } from "../../../common/utils/jwt_token";

const superAdminSerive = new SuperAdminService();

export class SuperAdminController {
  async loginPage(req: Request, res: Response) {
    res.render("superAdmin/login");
  }

  // async login(req: Request, res: Response) {
  //     try {
  //         const data = req.body;
  //         const email = data.email;
  //         const plainPass = data.password_hash;

  //         const superAdminData: any = await superAdminSerive.findByEmail(email);

  //         // const hash = await hashedPassword(plainPass);
  //         // console.log(hash);
  //         const compare = await comparePassword(superAdminData.password_hash, plainPass);
  //         const token = await assignJWT(email, superAdminData.user_id);
  //         if (compare) {
  //             return res.status(200).json({
  //                 message: "success",
  //                 token: token
  //             });
  //         }

  //         res.status(400).json("Password is Incorrect");
  //     }
  //     catch (err: any) {
  //         res.status(400).json(err.message);
  //     }
  // }

  // Refactored: JWT now includes userId + roleId to satisfy validToken & allowRoles middleware
  async login(req: Request, res: Response) {
    try {
      const { email, password_hash: plainPass } = req.body;

      const superAdminData: any = await superAdminSerive.findByEmail(email);

      if (!superAdminData) {
        return res.status(404).json({ message: "User not found" });
      }

      const isMatch = await comparePassword(
        superAdminData.password_hash,
        plainPass,
      );

      if (!isMatch) {
        return res.status(400).json({ message: "Password is incorrect" });
      }

      // ✅ Payload must match UserTokenPayload interface:
      // { userId: number, roleId: string, hotel_id?: string }
      const payload = {
        userId: superAdminData.user_id, // validToken reads this
        roleId: "SUPER_ADMIN", // allowRoles checks this
        hotel_id: superAdminData.hotel_id, // optional, passed through by validToken
      };
      console.log(payload);
      

      const token = jwt.sign(payload, process.env.JWT_SECRET!, {
        expiresIn: "1d",
      });

      // Store in httpOnly cookie — validToken reads from req.cookies.token
      storeToken(token, res);

      return res.status(200).json({ message: "Login successful" });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  }

  async getAllUserData(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const data = await superAdminSerive.getAllUserData();
      if (!data) {
        res.status(400).json("Data not found");
      }
      if (req.headers.accept?.includes("application/json")) {
        return res.json(data);
      }
      res.render("superAdmin/hotels_list", { data });
      // res.json(data);
    } catch (err) {
      res.status(400).json(err);
    }
  }
}
