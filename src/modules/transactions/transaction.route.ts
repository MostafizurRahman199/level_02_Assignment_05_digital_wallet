import { Router } from "express";
import { getMyTransactions, getMyCommissions, getAllTransactions } from "./transaction.controller";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware";
import { UserRole } from "../auth/auth.interface";

const router = Router();

// User & Agent can access their own transactions
router.get("/me", requireAuth, getMyTransactions); //work 

// Agent commission history
router.get("/commissions", requireAuth, requireRole(UserRole.AGENT), getMyCommissions); //work

// Admin only - all transactions
router.get("/admin/all", requireAuth, requireRole(UserRole.ADMIN), getAllTransactions); //work

export default router;