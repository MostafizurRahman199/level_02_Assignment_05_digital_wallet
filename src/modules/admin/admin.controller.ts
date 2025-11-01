import { Request, Response } from "express";
import { User } from "../auth/auth.model";
import { Wallet } from "../wallet/wallet.model";
import { Transaction } from "../transactions/transaction.model";


export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select("-password")
      .populate("wallet")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await User.countDocuments();

    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: {
        users,
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



export const getAllAgents = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const agents = await User.find({ role: "agent" })
      .select("-password")
      .populate("wallet")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await User.countDocuments({ role: "agent" });

    res.status(200).json({
      success: true,
      message: "Agents fetched successfully",
      data: {
        agents,
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



export const getAllWallets = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const wallets = await Wallet.find()
      .populate("user", "name phone role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Wallet.countDocuments();

    res.status(200).json({
      success: true,
      message: "Wallets fetched successfully",
      data: {
        wallets,
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



export const blockWallet = async (req: Request, res: Response) => {
  try {
    const { walletId } = req.params;

    const wallet = await Wallet.findById(walletId);
    if (!wallet) {
      return res.status(404).json({ success: false, message: "Wallet not found" });
    }

    wallet.isBlocked = true;
    await wallet.save();

    res.status(200).json({
      success: true,
      message: "Wallet blocked successfully",
      data: wallet
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};




export const unblockWallet = async (req: Request, res: Response) => {
  try {
    const { walletId } = req.params;

    const wallet = await Wallet.findById(walletId);
    if (!wallet) {
      return res.status(404).json({ success: false, message: "Wallet not found" });
    }

    wallet.isBlocked = false;
    await wallet.save();

    res.status(200).json({
      success: true,
      message: "Wallet unblocked successfully",
      data: wallet
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};



export const approveAgent = async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;

    const agent = await User.findByIdAndUpdate(
      agentId,
      { isApproved: true },
      { new: true, runValidators: true } // ✅ Returns updated document
    );

    if (!agent || agent.role !== "agent") {
      return res.status(404).json({ success: false, message: "Agent not found" });
    }

    res.status(200).json({
      success: true,
      message: "Agent approved successfully",
      data: agent // ✅ This will definitely have isApproved: true
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};




export const suspendAgent = async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;

    const agent = await User.findById(agentId);
    if (!agent || agent.role !== "agent") {
      return res.status(404).json({ success: false, message: "Agent not found" });
    }

    agent.isApproved = false;
    await agent.save();

    res.status(200).json({
      success: true,
      message: "Agent suspended successfully",
      data: agent
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};



export const blockUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.isActive = false;
    await user.save();

    // Also block their wallet
    await Wallet.findOneAndUpdate({ user: userId }, { isBlocked: true });

    res.status(200).json({
      success: true,
      message: "User blocked successfully",
      data: user
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};




export const unblockUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.isActive = true;
    await user.save();

    // Also unblock their wallet
    await Wallet.findOneAndUpdate({ user: userId }, { isBlocked: false });

    res.status(200).json({
      success: true,
      message: "User unblocked successfully",
      data: user
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};




export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalAgents = await User.countDocuments({ role: "agent" });
    const totalTransactions = await Transaction.countDocuments();
    const totalWalletBalance = await Wallet.aggregate([
      { $group: { _id: null, total: { $sum: "$balance" } } }
    ]);

    const recentTransactions = await Transaction.find()
      .populate("from", "name phone")
      .populate("to", "name phone")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    res.status(200).json({
      success: true,
      message: "Dashboard stats fetched successfully",
      data: {
        stats: {
          totalUsers,
          totalAgents,
          totalTransactions,
          totalWalletBalance: totalWalletBalance[0]?.total || 0
        },
        recentTransactions
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};