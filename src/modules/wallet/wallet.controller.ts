import { Request, Response } from "express";
import { 
  addMoney, 
  withdrawMoney, 
  sendMoney, 
  cashIn, 
  cashOut, 
  getWalletBalance, 
  initiateTopUpService,
  cashOutToAgent
} from "./wallet.service";





export const deposit = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.sub;
    const { amount } = req.body;

    const wallet = await addMoney(userId, amount);

    res.status(200).json({
      success: true,
      message: "Money added successfully",
      data: {
        balance: wallet.balance,
        previousBalance: wallet.balance - amount,
        amountAdded: amount
      }
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};






export const withdraw = async (req: Request, res: Response) => {
  try {
    
    const userId = (req as any).user.sub;
    const { amount } = req.body;

    const wallet = await withdrawMoney(userId, amount);

    res.status(200).json({
      success: true,
      message: "Money withdrawn successfully",
      data: {
        balance: wallet.balance,
        previousBalance: wallet.balance + amount,
        amountWithdrawn: amount
      }
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};






export const transfer = async (req: Request, res: Response) => {
  try {
    
    const userId = (req as any).user.sub;
    const { receiverPhone, amount } = req.body;

    const result = await sendMoney(userId, receiverPhone, amount);

    res.status(200).json({
      success: true,
      message: "Money sent successfully",
      data: {
        senderBalance: result.senderWallet.balance,
        receiverBalance: result.receiverWallet.balance,
        amountSent: amount,
        fee: result.fee
      }
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};





export const agentCashIn = async (req: Request, res: Response) => {
  try {
    
    const agentId = (req as any).user.sub;
    const { userPhone, amount } = req.body;

    const result = await cashIn(agentId, userPhone, amount);

    res.status(200).json({
      success: true,
      message: "Cash-in successful",
      data: {
        userBalance: result.userWallet.balance,
        agentBalance: result.agentWallet.balance,
        amount: amount,
        commission: result.commission
      }
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};




export const userCashOut = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.sub;
    const { agentPhone, amount } = req.body;

    const result = await cashOutToAgent(userId, agentPhone, amount);

    res.status(200).json({
      success: true,
      message: "Cash-out request successful",
      data: {
        userBalance: result.userWallet.balance,
        amount: amount,
        commission: result.commission,
        netReceived: amount - result.commission, // Amount user will get in cash
        agent: result.agent.phone,
        transactionId: result.transaction._id
      }
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};




export const getBalance = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.sub;
    const wallet = await getWalletBalance(userId);

    res.status(200).json({
      success: true,
      message: "Wallet balance fetched successfully",
      data: wallet
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};




export const initiateTopUp = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.sub;
    const { amount } = req.body;

    const result = await initiateTopUpService(userId, amount);

    res.status(200).json({
      success: true,
      message: "Top-up initiated successfully",
      data: result
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};