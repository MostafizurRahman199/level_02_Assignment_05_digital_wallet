
// src/modules/auth/auth.service.ts
import { User } from "./auth.model";
import { hashPassword, comparePassword } from "../../utils/hash.util";
import { generateToken } from "../../utils/jwt";
import { UserRole, JWTPayload } from "./auth.interface";
import { Wallet } from "../wallet/wallet.model";
import { Types } from "mongoose";

export const registerUser = async (data: {
  name: string;
  phone: string;
  password: string;
  role?: UserRole;
}) => {

  const existing = await User.findOne({ phone : data.phone });
  if (existing) throw new Error("Phone already registered");

  const hashed = await hashPassword(data.password);

  const user = await User.create({
    name: data.name,
    phone: data.phone,
    password: hashed,
    role: data.role || UserRole.USER,
  });

  // ✅ Create Wallet Automatically
  const wallet = await Wallet.create({ user: user._id, balance: 50 });
  user.wallet = wallet._id as Types.ObjectId;
  await user.save();

  const payload: JWTPayload = { sub: user._id.toString(), role: user.role };
  const token = generateToken(payload);

  return {
    user: {
      _id: user._id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      wallet: user.wallet,
    },
    token,
  };
};




export const loginUser = async (phone: string, password: string) => {
    
  const user = await User.findOne({ phone });
  if (!user) throw new Error("Invalid credentials");

  const valid = await comparePassword(password, user.password);
  if (!valid) throw new Error("Invalid credentials");

  if (!user.isActive) throw new Error("Account is blocked");

  const payload: JWTPayload = { sub: user._id.toString(), role: user.role };
  const token = generateToken(payload);

  return {
    user: {
      _id: user._id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      wallet: user.wallet,
    },
    token,
  };
};
