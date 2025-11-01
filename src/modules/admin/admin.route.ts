import { Router } from "express";
import { 
  getAllUsers, 
  getAllAgents, 
  getAllWallets, 
  blockWallet, 
  unblockWallet, 
  approveAgent, 
  suspendAgent, 
  blockUser, 
  unblockUser,
  getDashboardStats 
} from "./admin.controller";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware";
import { UserRole } from "../auth/auth.interface";

const router = Router();

// All admin routes require ADMIN role
router.use(requireAuth, requireRole(UserRole.ADMIN));


// Dashboard
router.get("/dashboard", getDashboardStats);


// User management
router.get("/users", getAllUsers);
router.patch("/users/:userId/block", blockUser);
router.patch("/users/:userId/unblock", unblockUser);


// Agent management
router.get("/agents", getAllAgents);
router.patch("/agents/:agentId/approve", approveAgent);
router.patch("/agents/:agentId/suspend", suspendAgent);


// Wallet management
router.get("/wallets", getAllWallets);
router.patch("/wallets/:walletId/block", blockWallet);
router.patch("/wallets/:walletId/unblock", unblockWallet);

const adminRoutes = router;
export default adminRoutes;