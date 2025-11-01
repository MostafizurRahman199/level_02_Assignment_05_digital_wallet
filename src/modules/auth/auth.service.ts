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


  //  Prevent public admin registration
  if (data.role === UserRole.ADMIN) {
    throw new Error("Admin registration is restricted");
  }

  const existing = await User.findOne({ phone: data.phone });
  if (existing) throw new Error("Phone already registered");

  const hashed = await hashPassword(data.password);

  // Different initial balances per role
  const getInitialBalance = (role: UserRole): number => {
    switch (role) {
      case UserRole.USER: return 50;
      case UserRole.AGENT: return 1000;
      default: return 50;
    }
  };

  const userRole = data.role || UserRole.USER;
  const initialBalance = getInitialBalance(userRole);

  // Create user with commission rate for agents
  const userData: any = {
    name: data.name,
    phone: data.phone,
    password: hashed,
    role: userRole,
  };

  // Set commission rate for agents
  if (userRole === UserRole.AGENT) {
    userData.commissionRate = 1.5;
  }

  const user = await User.create(userData);

  // Create Wallet Automatically
  const wallet = await Wallet.create({ 
    user: user._id, 
    balance: initialBalance 
  });

  // FIX: Update user with wallet reference with proper type casting
  user.wallet = wallet._id as Types.ObjectId;
  await user.save();


  const payload: JWTPayload = { 
    sub: user._id.toString(), 
    role: user.role,
    isApproved: user.isApproved
  };
  const token = generateToken(payload);

  return {
    user: {
      _id: user._id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      wallet: user.wallet,
      isApproved: user.isApproved,
      commissionRate: user.commissionRate,
      walletBalance: initialBalance,
      isActive: user.isActive
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

  // Check if agent is approved
  if (user.role === UserRole.AGENT && !user.isApproved) {
    throw new Error("Agent account pending approval");
  }

  const wallet = await Wallet.findOne({ user: user._id });
  if (!wallet) throw new Error("Wallet not found");

  // Check if wallet is blocked
  if (wallet.isBlocked) {
    throw new Error("Wallet is blocked. Please contact support.");
  }

  const payload: JWTPayload = { 
    sub: user._id.toString(), 
    role: user.role,
    isApproved: user.isApproved
  };
  const token = generateToken(payload);

  return {
    user: {
      _id: user._id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      wallet: user.wallet,
      isApproved: user.isApproved,
      commissionRate: user.commissionRate,
      walletBalance: wallet.balance,
      isActive: user.isActive
    },
    token,
  };
};




// NEW: Get user profile
export const getUserProfile = async (userId: string) => {
  const user = await User.findById(userId).select("-password");
  if (!user) throw new Error("User not found");

  const wallet = await Wallet.findOne({ user: user._id });
  
  return {
    _id: user._id,
    name: user.name,
    phone: user.phone,
    role: user.role,
    wallet: user.wallet,
    isApproved: user.isApproved,
    commissionRate: user.commissionRate,
    walletBalance: wallet?.balance || 0,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
};




// NEW: Update user profile
export const updateUserProfile = async (userId: string, updateData: { name?: string; phone?: string }) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  // Check if phone is being updated and if it's already taken
  if (updateData.phone && updateData.phone !== user.phone) {
    const existingUser = await User.findOne({ phone: updateData.phone });
    if (existingUser) throw new Error("Phone number already registered");
  }

  if (updateData.name) user.name = updateData.name;
  if (updateData.phone) user.phone = updateData.phone;

  await user.save();

  const wallet = await Wallet.findOne({ user: user._id });

  return {
    _id: user._id,
    name: user.name,
    phone: user.phone,
    role: user.role,
    wallet: user.wallet,
    isApproved: user.isApproved,
    commissionRate: user.commissionRate,
    walletBalance: wallet?.balance || 0,
    isActive: user.isActive
  };
};



// Change password
export const changePassword = async (userId: string, currentPassword: string, newPassword: string) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const valid = await comparePassword(currentPassword, user.password);
  if (!valid) throw new Error("Current password is incorrect");

  const hashedNewPassword = await hashPassword(newPassword);
  user.password = hashedNewPassword;
  
  await user.save();

  return { message: "Password changed successfully" };
};