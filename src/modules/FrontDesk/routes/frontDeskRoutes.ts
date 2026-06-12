import express from "express";
import { validToken } from "../../../common/middlewares/verifyJWTToken";
import { allowRoles } from "../../../common/middlewares/allowedRoles";
import * as frontDeskController from "../controller/frontDeskController";

const frontDeskRouter = express.Router();

//indexPage
frontDeskRouter.get("/home",validToken,allowRoles("FRONT_DESK"),frontDeskController.showHomePage);


//logoutPage
frontDeskRouter.get("/logout",validToken,allowRoles("FRONT_DESK"),frontDeskController.logout);
export default frontDeskRouter