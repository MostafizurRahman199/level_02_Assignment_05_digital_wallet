//src/routes/routes.ts

import { Router } from "express";

import authRoutes from "../modules/auth/auth.route";
import transactionRoutes from "../modules/transactions/transaction.route";
import paymentRoutes from "../modules/payment/payment.route";
import walletRoutes from "../modules/wallet/wallet.route";
import adminRoutes from "../modules/admin/admin.route";
import contactRoutes from "../modules/contact/contact.route";

const router = Router();

router.use("/auth", authRoutes);
router.use("/wallet", walletRoutes);
router.use("/transaction", transactionRoutes);
router.use("/payments", paymentRoutes);
router.use("/admin", adminRoutes);
router.use("/contact", contactRoutes);

export default router;
