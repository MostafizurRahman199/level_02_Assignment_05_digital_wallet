// src/modules/wallet/wallet.route.ts

import { Router } from "express";
import { deposit, withdraw, transfer } from "./wallet.controller";
// import { validateRequest } from "../../middlewares/validateRequest";
import { addMoneySchema, withdrawSchema, sendMoneySchema } from "./wallet.validation";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware";
import { validateRequest } from "../../middlewares/validateRequest";
import { UserRole } from "../auth/auth.interface";
// import { requireAuth, requireRole } from "../../middlewares/auth.middleware";

const router = Router();

// user only
router.post("/add", requireAuth, requireRole(UserRole.USER), validateRequest(addMoneySchema), deposit);

router.post("/withdraw", requireAuth, requireRole(UserRole.USER), validateRequest(withdrawSchema), withdraw);

router.post("/send", requireAuth, requireRole(UserRole.USER), validateRequest(sendMoneySchema), transfer);

export default router;
