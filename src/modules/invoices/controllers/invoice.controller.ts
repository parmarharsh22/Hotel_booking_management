import { Request, Response } from "express";
import { InvoiceService } from "../services/invoice.service";

const invoiceService = new InvoiceService();

export class InvoiceController {

  // GET /invoices/:bookingId
  // Compile + upsert, then show the invoice page
  async generateInvoice(req: Request, res: Response) {
    try {
      const hotelId   = (req as any).hotelId as number;
    // const hotelId = 1;
      const bookingId = parseInt(req.params.bookingId as any);

      const invoice = await invoiceService.generateInvoice(bookingId, hotelId);
      console.log(invoice);
      return res.status(200).render("invoices/invoice", { invoice });
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  }

  // GET /invoices/:bookingId/download
  // Idempotent regenerate, then render the printable page
  async downloadInvoice(req: Request, res: Response) {
    try {
    //   const hotelId   = (req as any).hotelId as number;
    const hotelId = 1;
      const bookingId = parseInt(req.params.bookingId as any);

      const invoice = await invoiceService.generateInvoice(bookingId, hotelId);
      return res.status(200).render("invoices/print", { invoice });
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  }

}