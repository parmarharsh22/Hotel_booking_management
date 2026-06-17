import express from "express";
import { validToken } from "../../../common/middlewares/verifyJWTToken";
import { allowRoles } from "../../../common/middlewares/allowedRoles";
import * as frontDeskController from "../controller/frontDeskController";
import { frontDeskContext } from "../../../common/middlewares/frontDeskOnly/loadSideBar";
import { upload } from "../../../common/middlewares/multerCloud";

const frontDeskRouter = express.Router();

// dashboard home
frontDeskRouter.get("/home",validToken,allowRoles("FRONT_DESK"),frontDeskController.showHomePage);

// guest confirmation page
frontDeskRouter.get("/checkIn/:bookingRef",validToken,frontDeskContext,allowRoles("FRONT_DESK"),frontDeskController.showGuestVerification);

// identity capture page
frontDeskRouter.get("/verifyIdentity/:bookingRef",validToken,frontDeskContext,allowRoles("FRONT_DESK"),frontDeskController.showDocumentGathring);

// upload identity document
frontDeskRouter.post("/uploadDocuments/:bookingRef",validToken,frontDeskContext,allowRoles("FRONT_DESK"),upload.single("document"),frontDeskController.storeDoc);

// room status page
frontDeskRouter.get("/showRoomStatuses",validToken,allowRoles("FRONT_DESK"),frontDeskContext,frontDeskController.showRoomStatus);

// get All bookings of the hotel
frontDeskRouter.get("/bookings",validToken,frontDeskContext,allowRoles("FRONT_DESK"),frontDeskController.getBookingsOfHotel);

//render all the guest that are currently checkedIN
frontDeskRouter.get("/checkout",validToken,frontDeskContext,allowRoles("FRONT_DESK"),frontDeskController.getAllCheckInGuests);

//checkout a particular user ID from Params
frontDeskRouter.get("/checkout/:bookingRef",validToken,frontDeskContext,allowRoles("FRONT_DESK"),frontDeskController.checkOutUser);

//emit a event and release the room
frontDeskRouter.post("/releaseRoom",validToken,frontDeskContext,allowRoles("FRONT_DESK"),frontDeskController.releaseRoom);

frontDeskRouter.post("/cleanRoom",validToken,frontDeskContext,allowRoles("FRONT_DESK"),frontDeskController.cleanRoom);

// logout
frontDeskRouter.get("/logout",validToken,frontDeskController.logout);

export default frontDeskRouter;