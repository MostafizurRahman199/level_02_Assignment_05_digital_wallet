// src/modules/wallet/wallet.validation.ts

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



export const topUpSchema = z.object({
  amount: z.number()
    .positive("Amount must be positive")
    .min(10, "Minimum top-up amount is ৳10")
    .max(50000, "Maximum top-up amount is ৳50,000"),
});



export const agentCashInSchema = z.object({
  userPhone: z.string().regex(/^01[0-9]{9}$/, "Invalid phone number"),
  amount: z.number().positive("Amount must be positive"),
});




export const cashOutSchema = z.object({
  agentPhone: z.string()
    .regex(/^01[0-9]{9}$/, "Invalid Bangladeshi phone number")
    .min(11, "Phone number must be 11 digits")
    .max(11, "Phone number must be 11 digits"),
  amount: z.number()
    .positive("Amount must be positive")
    .min(10, "Minimum cash-out amount is ৳10")
    .max(50000, "Maximum cash-out amount is ৳50,000"),
});