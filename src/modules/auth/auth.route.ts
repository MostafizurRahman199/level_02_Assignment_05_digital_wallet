import { Router } from "express";
import { register, login, getProfile, updateProfile, logout, changePassword } from "./auth.controller";
import { registerSchema, loginSchema, updateProfileSchema, changePasswordSchema } from "./auth.validation";
import { validateRequest } from "../../middlewares/validateRequest";
import { requireAuth } from "../../middlewares/auth.middleware";

const router = Router();

// Public routes
router.post("/register", validateRequest(registerSchema), register);
router.post("/login", validateRequest(loginSchema), login);

// Protected routes
router.get("/profile", requireAuth, getProfile);
router.patch("/profile", requireAuth, validateRequest(updateProfileSchema), updateProfile);
router.patch("/change-password", requireAuth, validateRequest(changePasswordSchema), changePassword);
router.post("/logout", requireAuth, logout);



const authRoutes = router;
export default authRoutes;
