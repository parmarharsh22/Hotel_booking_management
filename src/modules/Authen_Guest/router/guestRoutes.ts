import  express  from "express";
import { validToken } from "../../../common/middlewares/verifyJWTToken";
import * as authenGuestCont from "../controller/guestController";

const authenRoute = express.Router();

authenRoute.get("/updateProfile",validToken,authenGuestCont.showEditProfilePage);

export default authenRoute;