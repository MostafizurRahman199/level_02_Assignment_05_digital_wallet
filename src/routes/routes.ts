import { Router } from "express";
import authRoutes from "../modules/auth/auth.route";
import walletRoutes from "../modules/wallet/wallet.route";

const router = Router();

router.use("/auth", authRoutes);
router.use("/wallet", walletRoutes);

export default router;

