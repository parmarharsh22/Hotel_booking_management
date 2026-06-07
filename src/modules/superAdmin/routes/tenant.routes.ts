import express from "express";
import * as tenantController from "../controllers/tenant.controller";

const router = express.Router();

router.get("/", tenantController.listHotels);
router.get("/new", tenantController.showNewHotel);
router.post("/", tenantController.createHotel);

router.get("/:hotelId", tenantController.getHotel);
router.get("/:hotelId/edit", tenantController.showEditHotel);

router.put("/:hotelId", tenantController.updateHotel);
router.put("/:hotelId/status", tenantController.updateHotelStatus);

router.delete("/:hotelId", tenantController.deleteHotel);

export default router; 