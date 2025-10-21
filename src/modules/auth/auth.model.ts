// src/modules/auth/auth.model.ts

import { Schema, model } from "mongoose";
import { IUser, UserRole } from "./auth.interface";

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true, minlength: 6 },

    // ✅ Now linked to the enum values
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },

    wallet: { type: Schema.Types.ObjectId, ref: "Wallet" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const User = model<IUser>("User", userSchema);

