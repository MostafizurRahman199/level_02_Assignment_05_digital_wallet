import { z } from "zod";

// Bangladeshi phone number regex (starts with 01, then 3-9, then 8 digits)
const bangladeshiPhoneRegex = /^01[3-9]\d{8}$/;

export const registerSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),

  phone: z.string()
    .min(11, "Phone number must be 11 digits")
    .max(11, "Phone number must be 11 digits")
    .regex(bangladeshiPhoneRegex, "Please enter a valid Bangladeshi phone number (e.g., 01712345678)"),

  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password cannot exceed 100 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one lowercase letter, one uppercase letter, and one number"),

  // ✅ FIXED: Remove the unnecessary refine since enum already restricts values
  role: z.enum(["user", "agent"])
    .default("user")
    .optional(),
});



export const loginSchema = z.object({
  phone: z.string()
    .min(11, "Phone number must be 11 digits")
    .max(11, "Phone number must be 11 digits")
    .regex(bangladeshiPhoneRegex, "Please enter a valid Bangladeshi phone number"),

  password: z.string()
    .min(1, "Password is required"),
});



export const updateProfileSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces")
    .optional(),

  phone: z.string()
    .min(11, "Phone number must be 11 digits")
    .max(11, "Phone number must be 11 digits")
    .regex(bangladeshiPhoneRegex, "Please enter a valid Bangladeshi phone number")
    .optional(),
}).refine(data => data.name || data.phone, {
  message: "At least one field (name or phone) must be provided",
});



export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string()
    .min(6, "New password must be at least 6 characters")
    .max(100, "New password cannot exceed 100 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "New password must contain at least one lowercase letter, one uppercase letter, and one number"),
}).refine(data => data.currentPassword !== data.newPassword, {
  message: "New password must be different from current password",
});