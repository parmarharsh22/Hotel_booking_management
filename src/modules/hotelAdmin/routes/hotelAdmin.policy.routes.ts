import { Router } from "express";
import { AdminPolicyController } from "../controllers/hotelAdmin.policy.controller";
import { validToken } from "../../../common/middlewares/verifyJWTToken";
import { allowRoles } from "../../../common/middlewares/allowedRoles";

const adminController = new AdminPolicyController();
const router = Router();

// List all cancellation policies for this hotel
router.get("/policies",validToken,allowRoles("ADMIN"),adminController.listPolicies.bind(adminController));

// Show new policy form
router.get("/policies/new",validToken,allowRoles("ADMIN"),adminController.showNewPolicy.bind(adminController));

// Create a policy
router.post("/policies",validToken,allowRoles("ADMIN"),adminController.createPolicy.bind(adminController));

// Show edit form for a specific policy
router.get("/policies/:policyId/edit",validToken,allowRoles("ADMIN"),adminController.showEditPolicy.bind(adminController));

// Update a policy (method-override turns form POST → PUT)
router.put("/policies/:policyId",validToken,allowRoles("ADMIN"),adminController.updatePolicy.bind(adminController));

// Delete a policy (method-override turns form POST → DELETE)
router.delete("/policies/:policyId",validToken,allowRoles("ADMIN"),adminController.deletePolicy.bind(adminController));

export default router;