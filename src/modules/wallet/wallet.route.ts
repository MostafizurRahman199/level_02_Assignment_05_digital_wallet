//src/modules/wallet/wallet.route.ts


import { Router } from "express";
import { 
  transfer, 
  agentCashIn, 
  getBalance,
  initiateTopUp,  // ✅ ADD THIS
  userCashOut
} from "./wallet.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { sendMoneySchema, topUpSchema, cashOutSchema, agentCashInSchema } from "./wallet.validation"; // ✅ ADD topUpSchema
import { requireAuth, requireRole } from "../../middlewares/auth.middleware";
import { UserRole } from "../auth/auth.interface";

const router = Router();

// User wallet operations
router.get("/balance", requireAuth, getBalance); //work

router.post("/top-up", requireAuth, requireRole(UserRole.USER), validateRequest(topUpSchema), initiateTopUp); // work


router.post("/withdraw", requireAuth, requireRole(UserRole.USER), validateRequest(cashOutSchema), userCashOut); //work


router.post("/send", requireAuth, requireRole(UserRole.USER), validateRequest(sendMoneySchema), transfer); //work


// Agent operations 
router.post("/agent/cash-in", requireAuth, requireRole(UserRole.AGENT), validateRequest(agentCashInSchema), agentCashIn); //work 




export default router;