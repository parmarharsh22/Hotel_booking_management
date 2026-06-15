import { Router } from "express";
import { InvoiceController } from "../controllers/invoice.controller";
// adjust these import paths to match your project (same ones used in room-types routes)
import { validToken } from "../../../common/middlewares/verifyJWTToken";
import { allowRoles } from "../../../common/middlewares/allowedRoles";

const invoiceController = new InvoiceController();
const router = Router();

// Generate + view invoice
router.get(
  "/:bookingId",
  validToken,
  allowRoles("FRONT_DESK", "ADMIN"),
  invoiceController.generateInvoice.bind(invoiceController)
);

// Printable invoice
router.get(
  "/:bookingId/download",
  validToken,
  allowRoles("FRONT_DESK", "ADMIN"),
  invoiceController.downloadInvoice.bind(invoiceController)
);

export default router;