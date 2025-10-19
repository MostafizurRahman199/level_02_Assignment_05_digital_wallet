import { z } from "zod";

export const addMoneySchema = z.object({
  amount: z.number().positive("Amount must be positive"),
});

export const withdrawSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
});

export const sendMoneySchema = z.object({
  receiverPhone: z.string().regex(/^01[0-9]{9}$/, "Invalid phone number"),
  amount: z.number().positive("Amount must be positive"),
});
