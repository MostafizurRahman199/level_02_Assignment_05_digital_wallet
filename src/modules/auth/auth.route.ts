
// src/modules/auth/auth.route.ts
import { Router } from "express";
import { register, login } from "./auth.controller";
import { registerSchema, loginSchema } from "./auth.validation";
import { validateRequest } from "../../middlewares/validateRequest";

const router = Router();

router.post("/register", validateRequest(registerSchema), register);
router.post("/login", validateRequest(loginSchema), login);

export default router;
