import { Types } from "mongoose";
import { Transaction } from "./transaction.model";
import { TransactionType, TransactionStatus } from "./transaction.interface";

interface CreateTransactionParams {
  from: Types.ObjectId;
  to: Types.ObjectId;
  amount: number;
  type: TransactionType;
  initiatedBy: Types.ObjectId;
  fee?: number;
  commission?: number;
  description?: string;
  balanceBefore: number;
  balanceAfter: number;
}

export const createTransaction = async (params: CreateTransactionParams) => {
  return await Transaction.create({
    from: params.from,
    to: params.to,
    amount: params.amount,
    type: params.type,
    fee: params.fee || 0,
    commission: params.commission,
    description: params.description,
    balanceBefore: params.balanceBefore,
    balanceAfter: params.balanceAfter,
    initiatedBy: params.initiatedBy,
    status: TransactionStatus.COMPLETED
  });
};

export const getUserTransactions = async (userId: Types.ObjectId, page: number = 1, limit: number = 10) => {
  const skip = (page - 1) * limit;
  
  const transactions = await Transaction.find({
    $or: [{ from: userId }, { to: userId }]
  })
    .populate("from", "name phone")
    .populate("to", "name phone")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Transaction.countDocuments({
    $or: [{ from: userId }, { to: userId }]
  });

  return {
    transactions,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};





export const getAgentCommissionHistory = async (agentId: Types.ObjectId, page: number = 1, limit: number = 10) => {
  const skip = (page - 1) * limit;
  
  const commissions = await Transaction.find({
    type: TransactionType.COMMISSION,
    to: agentId
  })
    .populate("from", "name phone")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Transaction.countDocuments({
    type: TransactionType.COMMISSION,
    to: agentId
  });

  return {
    commissions,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};