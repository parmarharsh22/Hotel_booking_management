import bcrypt from "bcrypt";
import { StaffInterface,StaffUpdateInterface } from "../models/staff.model";
import { StaffModel } from "../models/staff.model";

export class StaffService{

// listStaff
  async getAllStaff(hotelId: number): Promise<StaffInterface[]> {
    try {
      if (!hotelId) throw new Error("Hotel ID is required.");
      return await StaffModel.getAllStaff(hotelId);
    } catch (err) {
      throw err;
    }
  }

// showEditStaff
  async getStaffById(userId: number, hotelId: number): Promise<StaffInterface> {
    try {
      if (!userId)  throw new Error("User ID is required.");
      if (!hotelId) throw new Error("Hotel ID is required.");
      const staff = await StaffModel.getStaffById(userId, hotelId);
      if (!staff) throw new Error("Staff member not found.");
      return staff;
    } catch (err) {
      throw err;
    }
  }

  // createStaff
  async createStaff(staff: StaffInterface, plainPassword: string): Promise<StaffInterface> {
    try {
      if (!staff.first_name)  throw new Error("First name is required.");
      if (!staff.last_name)   throw new Error("Last name is required.");
      if (!staff.email)       throw new Error("Email is required.");
      if (!plainPassword)     throw new Error("Password is required.");

      // hash password before saving
      const password_hash = await bcrypt.hash(plainPassword, 10);

      // always FRONT_DESK role
      const staffData: StaffInterface = {
        ...staff,
        user_role_id: 2,
        password_hash,
      };

      return await StaffModel.createStaff(staffData);
    } catch (err) {
      throw err;
    }
  }


   // updateStaff
  async updateStaff(userId: number, hotelId: number, data: StaffUpdateInterface): Promise<boolean> {
    try {
      if (!userId)       throw new Error("User ID is required.");
      if (!hotelId)      throw new Error("Hotel ID is required.");
      if (!data.first_name) throw new Error("First name is required.");
      if (!data.last_name)  throw new Error("Last name is required.");
      if (!data.email)      throw new Error("Email is required.");

      const updated = await StaffModel.updateStaff(userId, hotelId, data);
      if (!updated) throw new Error("Staff member not found or no changes made.");
      return updated;
    } catch (err) {
      throw err;
    }
  }

   // deleteStaff (soft delete)
  async deactivateStaff(userId: number, hotelId: number): Promise<boolean> {
    try {
      if (!userId)  throw new Error("User ID is required.");
      if (!hotelId) throw new Error("Hotel ID is required.");
      const deactivated = await StaffModel.deactivateStaff(userId, hotelId);
      if (!deactivated) throw new Error("Staff member not found.");
      return deactivated;
    } catch (err) {
      throw err;
    }
  }



}