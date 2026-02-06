// src/modules/contact/contact.validation.ts

import { z } from "zod";

export const contactValidation = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone must be at least 10 characters").max(20),
  message: z.string().min(10, "Message must be at least 10 characters").max(1000),
});
