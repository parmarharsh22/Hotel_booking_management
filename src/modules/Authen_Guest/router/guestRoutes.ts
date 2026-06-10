import  express  from "express";
import { validToken } from "../../../common/middlewares/verifyJWTToken";
import { uploadProfilePhoto } from "../../../common/middlewares/multer";
import * as authenGuestCont from "../controller/guestController";

const authenRoute = express.Router();

//get the user Profile
authenRoute.get("/fetchUserDetails",validToken,authenGuestCont.getUserDetails);

//update the profile
authenRoute.post("/updateProfile",validToken,uploadProfilePhoto.single("avatar"),authenGuestCont.updateProfile);

// Logout a exisiting user
authenRoute.get("/logout",validToken,authenGuestCont.logoutUser)

export default authenRoute;