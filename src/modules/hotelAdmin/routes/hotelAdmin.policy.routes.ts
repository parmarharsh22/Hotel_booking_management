import { Router } from "express";
import { AdminPolicyController } from "../controllers/hotelAdmin.policy.controller";

const adminController = new AdminPolicyController();
const router = Router();

// List all cancellation policies for this hotel
router.get("/policies", adminController.listPolicies.bind(adminController));

// Show new policy form
router.get("/policies/new", adminController.showNewPolicy.bind(adminController));

// Create a policy
router.post("/policies", adminController.createPolicy.bind(adminController));

// Show edit form for a specific policy
router.get("/policies/:policyId/edit", adminController.showEditPolicy.bind(adminController));

// Update a policy (method-override turns form POST → PUT)
router.put("/policies/:policyId", adminController.updatePolicy.bind(adminController));

// Delete a policy (method-override turns form POST → DELETE)
router.delete("/policies/:policyId", adminController.deletePolicy.bind(adminController));

export default router;