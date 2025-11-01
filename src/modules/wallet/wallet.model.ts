// src/modules/wallet/wallet.model.ts

import { Schema, model } from "mongoose";
import { IWallet } from "./wallet.interface";

const walletSchema = new Schema<IWallet>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    balance: { type: Number, default: 50 }, // initial ৳50
    isBlocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Wallet = model<IWallet>("Wallet", walletSchema);
