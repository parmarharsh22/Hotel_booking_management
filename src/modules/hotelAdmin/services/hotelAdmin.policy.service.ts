import { PolicyInterface, PolicyUpdateInterface } from "../models/hotelAdmin.policy.model";
import { PolicyModel } from "../models/hotelAdmin.policy.model";

export class PolicyService {

  // listPolicies — just needs a valid hotelId
  async getAllPoliciesByHotel(hotelId: number): Promise<PolicyInterface[]> {
    try {
      if (!hotelId) throw new Error("Hotel ID is required.");
      const policies = await PolicyModel.getAllPoliciesByHotel(hotelId);
      return policies;
    } catch (err) {
      throw err;
    }
  }

  // showEditPolicy — needs both policyId and hotelId
  async getPolicyById(policyId: number, hotelId: number): Promise<PolicyInterface> {
    try {
      if (!policyId) throw new Error("Policy ID is required.");
      if (!hotelId)  throw new Error("Hotel ID is required.");
      const policy = await PolicyModel.getPolicyById(policyId, hotelId);
      if (!policy) throw new Error("Policy not found.");
      return policy;
    } catch (err) {
      throw err;
    }
  }

  // createPolicy — validate, range-check, and enforce one-policy-per-room-type
  async createPolicy(policy: PolicyInterface): Promise<PolicyInterface> {
    try {
      if (!policy.hotel_id)     throw new Error("Hotel ID is required.");
      if (!policy.room_type_id) throw new Error("Room type is required.");
      if (policy.free_cancellation_hours == null) throw new Error("Free cancellation hours is required.");
      if (policy.refund_percentage == null)       throw new Error("Refund percentage is required.");

      if (policy.free_cancellation_hours < 0) {
        throw new Error("Free cancellation hours cannot be negative.");
      }
      if (policy.refund_percentage < 0 || policy.refund_percentage > 100) {
        throw new Error("Refund percentage must be between 0 and 100.");
      }

      // (hotel_id, room_type_id) is unique — block duplicates with a clean message
      const existing = await PolicyModel.getPolicyByRoomType(policy.hotel_id, policy.room_type_id);
      if (existing) throw new Error("A cancellation policy already exists for this room type.");

      const created = await PolicyModel.createPolicy(policy);
      return created;
    } catch (err) {
      throw err;
    }
  }

  // updatePolicy — at least one field must be present
  async updatePolicy(policyId: number, hotelId: number, data: PolicyUpdateInterface): Promise<boolean> {
    try {
      if (!policyId) throw new Error("Policy ID is required.");
      if (!hotelId)  throw new Error("Hotel ID is required.");
      if (data.free_cancellation_hours == null && data.refund_percentage == null) {
        throw new Error("Provide free_cancellation_hours or refund_percentage to update.");
      }
      if (data.free_cancellation_hours != null && data.free_cancellation_hours < 0) {
        throw new Error("Free cancellation hours cannot be negative.");
      }
      if (data.refund_percentage != null && (data.refund_percentage < 0 || data.refund_percentage > 100)) {
        throw new Error("Refund percentage must be between 0 and 100.");
      }

      const updated = await PolicyModel.updatePolicy(policyId, hotelId, data);
      if (!updated) throw new Error("Policy not found or no changes made.");
      return updated;
    } catch (err) {
      throw err;
    }
  }

  // deletePolicy
  async deletePolicy(policyId: number, hotelId: number): Promise<boolean> {
    try {
      if (!policyId) throw new Error("Policy ID is required.");
      if (!hotelId)  throw new Error("Hotel ID is required.");
      const deleted = await PolicyModel.deletePolicy(policyId, hotelId);
      if (!deleted) throw new Error("Policy not found or already deleted.");
      return deleted;
    } catch (err) {
      throw err;
    }
  }

}