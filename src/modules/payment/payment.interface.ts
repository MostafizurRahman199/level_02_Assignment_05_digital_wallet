import { Types } from "mongoose";

export enum PAYMENT_STATUS {
  PENDING = "PENDING",
  PAID = "PAID",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED"
}

export interface IPayment {
  user: Types.ObjectId;
  transactionId: string;
  amount: number;
  paymentGatewayData?: any;
  status: PAYMENT_STATUS;
  createdAt: Date;
  updatedAt: Date;
}