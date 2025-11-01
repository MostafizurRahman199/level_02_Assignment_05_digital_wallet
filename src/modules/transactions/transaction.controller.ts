import { Request, Response } from "express";
import { getUserTransactions, getAgentCommissionHistory } from "./transaction.service";
import { UserRole } from "../auth/auth.interface";
import { Transaction } from "./transaction.model";

export const getMyTransactions = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.sub;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await getUserTransactions(userId, page, limit);

    res.status(200).json({
      success: true,
      message: "Transactions fetched successfully",
      data: result
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyCommissions = async (req: Request, res: Response) => {
  try {
    const agentId = (req as any).user.sub;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await getAgentCommissionHistory(agentId, page, limit);

    res.status(200).json({
      success: true,
      message: "Commission history fetched successfully",
      data: result
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllTransactions = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const transactions = await Transaction.find()
      .populate("from", "name phone")
      .populate("to", "name phone")
      .populate("initiatedBy", "name phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Transaction.countDocuments();

    res.status(200).json({
      success: true,
      message: "All transactions fetched successfully",
      data: {
        transactions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};