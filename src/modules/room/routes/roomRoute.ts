import express from 'express';
import * as roomController from '../controller/roomController';
import { validToken } from '../../../common/middlewares/verifyJWTToken';

const roomRouter=express.Router();

roomRouter.post('/searchHotels',roomController.searchHotels)

roomRouter.post('/bookingHold',validToken,roomController.createHold)

roomRouter.get('/payment',validToken,roomController.redirectPayment)

roomRouter.get('/hotelDetails/:hotelId',roomController.hotelDetails)

export default roomRouter;