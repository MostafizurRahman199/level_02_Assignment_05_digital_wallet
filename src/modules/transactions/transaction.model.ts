import { Schema, model } from "mongoose";
import { ITransaction, TransactionType, TransactionStatus } from "./transaction.interface";

const transactionSchema = new Schema<ITransaction>(
  {
    from: { type: Schema.Types.ObjectId, ref: "User", required: true },
    to: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true, min: 0 },
    fee: { type: Number, default: 0, min: 0 },
    commission: { type: Number, min: 0 },
    type: {
      type: String,
      enum: Object.values(TransactionType),
      required: true
    },
    status: {
      type: String,
      enum: Object.values(TransactionStatus),
      default: TransactionStatus.COMPLETED
    },
    description: { type: String },
    balanceBefore: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    initiatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

// Index for better query performance
transactionSchema.index({ from: 1, createdAt: -1 });
transactionSchema.index({ to: 1, createdAt: -1 });
transactionSchema.index({ initiatedBy: 1, createdAt: -1 });

export const Transaction = model<ITransaction>("Transaction", transactionSchema);