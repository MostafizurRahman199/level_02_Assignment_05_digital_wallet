import { Document, Types } from "mongoose";

export enum TransactionType {
  DEPOSIT = "DEPOSIT",
  WITHDRAW = "WITHDRAW",
  SEND_MONEY = "SEND_MONEY",
  CASH_IN = "CASH_IN",
  CASH_OUT = "CASH_OUT",
  COMMISSION = "COMMISSION"
}

export enum TransactionStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  REVERSED = "REVERSED"
}

export interface ITransaction extends Document {
  from: Types.ObjectId;
  to: Types.ObjectId;
  amount: number;
  fee: number;
  commission?: number;
  type: TransactionType;
  status: TransactionStatus;
  description?: string;
  balanceBefore: number;
  balanceAfter: number;
  initiatedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}