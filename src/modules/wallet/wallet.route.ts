import { Router } from "express";
import { deposit, withdraw, transfer } from "./wallet.controller";
// import { validateRequest } from "../../middlewares/validateRequest";
import { addMoneySchema, withdrawSchema, sendMoneySchema } from "./wallet.validation";
// import { requireAuth, requireRole } from "../../middlewares/auth.middleware";

const router = Router();

// user only
router.post("/add", requireAuth, requireRole("user"), validateRequest(addMoneySchema), deposit);
router.post("/withdraw", requireAuth, requireRole("user"), validateRequest(withdrawSchema), withdraw);
router.post("/send", requireAuth, requireRole("user"), validateRequest(sendMoneySchema), transfer);

export default router;
