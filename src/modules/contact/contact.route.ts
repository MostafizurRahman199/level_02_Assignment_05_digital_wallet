// src/modules/contact/contact.route.ts

import { Router } from "express";
import * as contactController from "./contact.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { contactValidation } from "./contact.validation";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware";
import { UserRole } from "../auth/auth.interface";

const router = Router();

// ✅ PUBLIC ROUTE - Anyone can submit a contact message
router.post("/", validateRequest(contactValidation), contactController.createMessage);

// ✅ ADMIN ONLY ROUTES - Only admins can view/manage messages
router.get("/", requireAuth, requireRole(UserRole.ADMIN), contactController.getAllMessages);

router.get("/unread-count", requireAuth, requireRole(UserRole.ADMIN), contactController.getUnreadCount);

router.get("/:id", requireAuth, requireRole(UserRole.ADMIN), contactController.getMessageById);

router.patch("/:id/mark-read", requireAuth, requireRole(UserRole.ADMIN), contactController.markMessageAsRead);

router.delete("/:id", requireAuth, requireRole(UserRole.ADMIN), contactController.deleteMessage);

export default router;
