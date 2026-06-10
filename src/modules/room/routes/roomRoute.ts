import express from 'express';
import * as roomController from '../controller/roomController';

const roomRouter=express.Router();

roomRouter.post('/searchHotels',roomController.searchHotels)

roomRouter.get('/:hotelId',roomController.hotelDetails)

export default roomRouter;