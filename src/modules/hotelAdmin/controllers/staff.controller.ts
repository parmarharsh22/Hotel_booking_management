import { StaffService } from "../services/staff.service";
import { Request,Response } from "express";

const staffService = new StaffService();

export class AdminStaffController{

// GET /admin/staff
  async listStaff(req: Request, res: Response) {
    try {
      const hotelId = (req as any).hotelId as number;
      const staff   = await staffService.getAllStaff(hotelId);
      return res.status(200).render("admin/staff", { staff });
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  }

   // GET /admin/staff/new
  // just renders the empty form — no DB call needed
  async showNewStaff(req: Request, res: Response) {
    try {
      return res.status(200).render("admin/staff-new");
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  }


   // POST /admin/staff
  async createStaff(req: Request, res: Response) {
    try {
      const hotelId = (req as any).hotelId as number;
      const files: any = req.files;
      const photo_url = files?.staff_photo ? files.staff_photo[0].path : null;
      const staff = {
        hotel_id:    hotelId,
        user_role_id: 3,            
        first_name:  req.body.first_name,
        last_name:   req.body.last_name,
        email:       req.body.email,
        phone:       req.body.phone || null,
        dob:         req.body.dob,
        gender:      req.body.gender,
        photo_url,
        state: req.body.state,
        city: req.body.city,
        address: req.body.address
      };

      await staffService.createStaff(staff, req.body.password);
      return res.redirect("/admin/staff");
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  }


   // GET /admin/staff/:userId/edit
  async showEditStaff(req: Request, res: Response) {
    try {
      const hotelId = (req as any).hotelId as number;
      const userId  = parseInt(req.params.userId as any);
      const staff   = await staffService.getStaffById(userId, hotelId);
      return res.status(200).render("admin/staff-edit", { staff });
    } catch (err: any) {
      return res.status(404).json({ message: err.message });
    }
  }

   // PUT /admin/staff/:userId
  async updateStaff(req: Request, res: Response) {
    try {
      const hotelId = (req as any).hotelId as number;
      const userId  = parseInt(req.params.userId as any);
      const files: any = req.files;
      const photo_url = files?.staff_photo ? files.staff_photo[0].path : req.body.existing_photo || null;

      const data = {
        first_name: req.body.first_name,
        last_name:  req.body.last_name,
        email:      req.body.email,
        phone:      req.body.phone || null,
        address:    req.body.address,
        photo_url,
      };
      await staffService.updateStaff(userId, hotelId, data);
      return res.redirect("/admin/staff");
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  }


  // DELETE /admin/staff/:userId  →  soft delete (is_active = 0)
  async deleteStaff(req: Request, res: Response) {
    try {
      const hotelId = (req as any).hotelId as number;
      const userId  = parseInt(req.params.userId as any);
      await staffService.deactivateStaff(userId, hotelId);
      return res.redirect("/admin/staff");
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  }

}