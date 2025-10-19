import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name is required"),
    phone: z
      .string()
      .min(10, "Phone must be at least 10 digits")
      .max(15, "Phone number too long"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["admin", "user", "agent"]).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    phone: z.string().min(10, "Phone number required"),
    password: z.string().min(6, "Password required"),
  }),
});
