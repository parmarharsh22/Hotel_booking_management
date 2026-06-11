import { Request, Response } from "express";
import { PolicyService } from "../services/hotelAdmin.policy.service";

const policyService = new PolicyService();

export class AdminPolicyController {

  // GET /admin/policies
  async listPolicies(req: Request, res: Response) {
    try {
      const hotelId = (req as any).hotelId as number;
      const policies = await policyService.getAllPoliciesByHotel(hotelId);
      return res.status(200).render("admin/policies", { policies });
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  }

  // GET /admin/policies/new
  async showNewPolicy(req: Request, res: Response) {
    try {
      return res.status(200).render("admin/policy-new");
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  }

  // POST /admin/policies
  async createPolicy(req: Request, res: Response) {
    try {
    //   const hotelId = (req as any).hotelId as number;
      const hotelId = 1;
      const policy = {
        hotel_id:                hotelId,
        room_type_id:            parseInt(req.body.room_type_id),
        free_cancellation_hours: parseInt(req.body.free_cancellation_hours),
        refund_percentage:       parseFloat(req.body.refund_percentage),
      };

      await policyService.createPolicy(policy);
      return res.redirect("/admin/policies");
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  }

  // GET /admin/policies/:policyId/edit
  async showEditPolicy(req: Request, res: Response) {
    try {
      const hotelId  = (req as any).hotelId as number;
      const policyId = parseInt(req.params.policyId as any);

      const policy = await policyService.getPolicyById(policyId, hotelId);
      return res.status(200).render("admin/policy-edit", { policy });
    } catch (err: any) {
      return res.status(404).json({ message: err.message });
    }
  }

  // PUT /admin/policies/:policyId
  async updatePolicy(req: Request, res: Response) {
    try {
    //   const hotelId  = (req as any).hotelId as number;
        const hotelId = 1;
    const policyId = parseInt(req.params.policyId as any);

      const data = {
        free_cancellation_hours: req.body.free_cancellation_hours != null
          ? parseInt(req.body.free_cancellation_hours)
          : undefined,
        refund_percentage: req.body.refund_percentage != null
          ? parseFloat(req.body.refund_percentage)
          : undefined,
      };

      await policyService.updatePolicy(policyId, hotelId, data);
      return res.redirect("/admin/policies");
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  }

  // DELETE /admin/policies/:policyId
  async deletePolicy(req: Request, res: Response) {
    try {
      const hotelId  = (req as any).hotelId as number;
      const policyId = parseInt(req.params.policyId as any);

      await policyService.deletePolicy(policyId, hotelId);
      return res.redirect("/admin/policies");
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  }

}