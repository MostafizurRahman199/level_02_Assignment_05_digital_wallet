import { Router } from "express";
import {
  initiateAddMoneyController,
  paymentSuccess,
  paymentFail,
  paymentCancel,
  getPaymentHistoryController,
  validatePayment,
} from "./payment.controller";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware";
import { UserRole } from "../auth/auth.interface";

const router = Router();

// User payment routes
router.post("/initiate", requireAuth, requireRole(UserRole.USER), initiateAddMoneyController);
router.get("/history", requireAuth, requireRole(UserRole.USER), getPaymentHistoryController);

// SSL Commerz callbacks (no auth required - called by payment gateway)
router.get("/success", paymentSuccess);
router.get("/fail", paymentFail);
router.get("/cancel", paymentCancel);
router.post("/validate", validatePayment);


const paymentRoutes = router;
export default paymentRoutes;