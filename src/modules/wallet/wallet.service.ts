// src/modules/wallet/wallet.service.ts

import mongoose from "mongoose";
import { Wallet } from "./wallet.model";
import { User } from "../auth/auth.model";



export async function addMoney(userId: string, amount: number) {
  const wallet = await Wallet.findOne({ user: userId });
  if (!wallet) throw new Error("Wallet not found");
  if (wallet.isBlocked) throw new Error("Wallet is blocked");

  wallet.balance += amount;
  await wallet.save();

  return wallet;
}




export async function withdrawMoney(userId: string, amount: number) {
  const wallet = await Wallet.findOne({ user: userId });
  if (!wallet) throw new Error("Wallet not found");
  if (wallet.isBlocked) throw new Error("Wallet is blocked");

  if (wallet.balance < amount) throw new Error("Insufficient balance");

  wallet.balance -= amount;
  await wallet.save();

  return wallet;
}

export async function sendMoney(senderId: string, receiverPhone: string, amount: number) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const sender = await User.findById(senderId).session(session);
    const receiver = await User.findOne({ phone: receiverPhone }).session(session);
    if (!sender || !receiver) throw new Error("Receiver not found");

    const senderWallet = await Wallet.findOne({ user: sender._id }).session(session);
    const receiverWallet = await Wallet.findOne({ user: receiver._id }).session(session);

    if (!senderWallet || !receiverWallet) throw new Error("Wallet not found");
    if (senderWallet.isBlocked || receiverWallet.isBlocked)
      throw new Error("One of the wallets is blocked");
    if (senderWallet.balance < amount) throw new Error("Insufficient balance");

    // Transaction
    senderWallet.balance -= amount;
    receiverWallet.balance += amount;

    await senderWallet.save({ session });
    await receiverWallet.save({ session });

    await session.commitTransaction();
    session.endSession();

    return { senderWallet, receiverWallet };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
}
