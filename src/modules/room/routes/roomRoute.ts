import express from 'express';
import * as roomController from '../controller/roomController';

const roomRouter=express.Router();

roomRouter.post('/searchHotels',roomController.searchHotels)

export default roomRouter;