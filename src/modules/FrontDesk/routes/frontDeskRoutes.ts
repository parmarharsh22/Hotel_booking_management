import express from "express";
import { validToken } from "../../../common/middlewares/verifyJWTToken";
import { allowRoles } from "../../../common/middlewares/allowedRoles";
import * as frontDeskController from "../controller/frontDeskController";
import { frontDeskContext } from "../../../common/middlewares/frontDeskOnly/loadSideBar";
import { upload } from "../../../common/middlewares/multerCloud";

const frontDeskRouter = express.Router();

//indexPage
frontDeskRouter.get("/home",validToken,allowRoles("FRONT_DESK"),frontDeskController.showHomePage);

//render guestVerification
frontDeskRouter.get("/checkIn/:bookingRef",validToken,frontDeskContext,allowRoles("FRONT_DESK"),frontDeskController.showGuestVerification);

//document verification
frontDeskRouter.get('/verifyIdentity/:bookingRef',validToken,frontDeskContext,allowRoles("FRONT_DESK"),frontDeskController.showDocumentGathring);

//uploading the verified doc to cloud
frontDeskRouter.post("/uploadDocuments/:bookingRef",validToken,frontDeskContext,allowRoles("FRONT_DESK"),upload.single("document"),frontDeskController.storeDoc);

//logoutPage
frontDeskRouter.get("/logout",validToken,frontDeskContext,allowRoles("FRONT_DESK"),frontDeskController.logout);

export default frontDeskRouter