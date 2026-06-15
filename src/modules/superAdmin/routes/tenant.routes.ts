import express from "express";
import * as tenantController from "../controllers/tenant.controller";
import { upload } from "../../../common/middlewares/multerCloud";
import { validToken } from "../../../common/middlewares/verifyJWTToken";
import { allowRoles } from "../../../common/middlewares/allowedRoles";

const router = express.Router();

router.use(validToken);
router.use(allowRoles("SUPER_ADMIN"));

router.get("/", tenantController.listHotels);

router.get("/users", tenantController.listUsers);

router.get("/new", tenantController.showNewHotel);

router.post(
    "/",
    upload.fields([
        { name: "logo_url", maxCount: 1 },
        { name: "cover_url", maxCount: 1 },
    ]),
    tenantController.createHotel
);

router.get("/:hotelId", tenantController.getHotel);

router.get("/:hotelId/edit", tenantController.showEditHotel);

router.put(
    "/:hotelId",
    upload.fields([
        { name: "logo_url", maxCount: 1 },
        { name: "cover_url", maxCount: 1 },
    ]),
    tenantController.updateHotel
);

router.put("/:hotelId/status", tenantController.updateHotelStatus);

router.delete("/:hotelId", tenantController.deleteHotel);

export default router;