import mongoose from "mongoose";
import { User } from "../auth/auth.model";
import { Wallet } from "../wallet/wallet.model";
import { Payment } from "./payment.model";
import { SSLService } from "./sslCommerz.service";
import { PAYMENT_STATUS } from "./payment.interface";
import { createTransaction } from "../transactions/transaction.service";
import { TransactionType } from "../transactions/transaction.interface";


// Generate unique transaction ID
const generateTransactionId = (): string => {
  return `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
};

export const initiateAddMoney = async (userId: string, amount: number) => {
 
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const transactionId = generateTransactionId();

  // Create payment record
  const payment = await Payment.create({
    user: userId,
    transactionId,
    amount,
    status: PAYMENT_STATUS.PENDING,
  });

  // Initiate SSL Commerz payment
  const sslResponse = await SSLService.sslPaymentInit({
    amount,
    transactionId,
    name: user.name,
    email: user.phone + "@wallet.com", // Using phone as email placeholder
    phone: user.phone,
    address: "Digital Wallet User",
  });

  return {
    paymentId: payment._id,
    transactionId,
    paymentUrl: sslResponse.GatewayPageURL,
  };
};




export const handlePaymentSuccess = async (transactionId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find and update payment
    const payment = await Payment.findOne({ transactionId }).session(session);
    if (!payment) throw new Error("Payment not found");

    if (payment.status === PAYMENT_STATUS.PAID) {
      throw new Error("Payment already processed");
    }

    payment.status = PAYMENT_STATUS.PAID;
    await payment.save({ session });

    // Add money to wallet
    const wallet = await Wallet.findOne({ user: payment.user }).session(session);
    if (!wallet) throw new Error("Wallet not found");

    const balanceBefore = wallet.balance;
    wallet.balance += payment.amount;
    const balanceAfter = wallet.balance;
    await wallet.save({ session });

    // Create transaction record
    await createTransaction({
      from: payment.user,
      to: payment.user,
      amount: payment.amount,
      type: TransactionType.DEPOSIT,
      initiatedBy: payment.user,
      balanceBefore,
      balanceAfter,
      description: "Wallet top-up via payment gateway",
    });

    await session.commitTransaction();
    session.endSession();

    return {
      success: true,
      message: "Payment successful and money added to wallet",
      amount: payment.amount,
      newBalance: balanceAfter,
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};



export const handlePaymentFailure = async (transactionId: string) => {
  const payment = await Payment.findOne({ transactionId });
  if (!payment) throw new Error("Payment not found");

  payment.status = PAYMENT_STATUS.FAILED;
  await payment.save();

  return {
    success: false,
    message: "Payment failed",
    transactionId,
  };
};



export const handlePaymentCancel = async (transactionId: string) => {
  const payment = await Payment.findOne({ transactionId });
  if (!payment) throw new Error("Payment not found");

  payment.status = PAYMENT_STATUS.CANCELLED;
  await payment.save();

  return {
    success: false,
    message: "Payment cancelled",
    transactionId,
  };
};



export const getPaymentHistory = async (userId: string, page: number = 1, limit: number = 10) => {
  const skip = (page - 1) * limit;

  const payments = await Payment.find({ user: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Payment.countDocuments({ user: userId });

  return {
    payments,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};