import mongoose from "mongoose";
import { Wallet } from "./wallet.model";
import { User } from "../auth/auth.model";
import { createTransaction } from "../transactions/transaction.service";
import { TransactionType } from "../transactions/transaction.interface";
import { initiateAddMoney } from "../payment/payment.service";
import { UserRole } from "../auth/auth.interface";


export async function addMoney(userId: string, amount: number) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const wallet = await Wallet.findOne({ user: userId }).session(session);
    if (!wallet) throw new Error("Wallet not found");
    if (wallet.isBlocked) throw new Error("Wallet is blocked");

    const balanceBefore = wallet.balance;
    wallet.balance += amount;
    const balanceAfter = wallet.balance;
    
    await wallet.save({ session });

    //  CREATE TRANSACTION RECORD
    await createTransaction({
      from: new mongoose.Types.ObjectId(userId),
      to: new mongoose.Types.ObjectId(userId),
      amount,
      type: TransactionType.DEPOSIT,
      initiatedBy: new mongoose.Types.ObjectId(userId),
      balanceBefore,
      balanceAfter,
      description: "Self deposit"
    });

    await session.commitTransaction();
    session.endSession();

    return wallet;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
}




export async function withdrawMoney(userId: string, amount: number) {

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const wallet = await Wallet.findOne({ user: userId }).session(session);
    if (!wallet) throw new Error("Wallet not found");
    if (wallet.isBlocked) throw new Error("Wallet is blocked");

    if (wallet.balance < amount) throw new Error("Insufficient balance");

    const balanceBefore = wallet.balance;
    wallet.balance -= amount;
    const balanceAfter = wallet.balance;
    
    await wallet.save({ session });

    // CREATE TRANSACTION RECORD
    await createTransaction({
      from: new mongoose.Types.ObjectId(userId),
      to: new mongoose.Types.ObjectId(userId),
      amount,
      type: TransactionType.WITHDRAW,
      initiatedBy: new mongoose.Types.ObjectId(userId),
      balanceBefore,
      balanceAfter,
      description: "Self withdrawal"
    });

    await session.commitTransaction();
    session.endSession();

    return wallet;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
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

    // Calculate fee (1% of amount)
    const fee = amount * 0.01;
    const totalDeduction = amount + fee;

    if (senderWallet.balance < totalDeduction) {
      throw new Error("Insufficient balance including transaction fee");
    }

    const senderBalanceBefore = senderWallet.balance;
    senderWallet.balance -= totalDeduction;
    const senderBalanceAfter = senderWallet.balance;

    const receiverBalanceBefore = receiverWallet.balance;
    receiverWallet.balance += amount;
    const receiverBalanceAfter = receiverWallet.balance;

    await senderWallet.save({ session });
    await receiverWallet.save({ session });

    // CREATE TRANSACTION RECORDS
    await createTransaction({
      from: sender._id,
      to: receiver._id,
      amount,
      type: TransactionType.SEND_MONEY,
      initiatedBy: sender._id,
      fee,
      balanceBefore: senderBalanceBefore,
      balanceAfter: senderBalanceAfter,
      description: `Send money to ${receiver.phone}`
    });

    await createTransaction({
      from: sender._id,
      to: receiver._id,
      amount,
      type: TransactionType.DEPOSIT,
      initiatedBy: sender._id,
      balanceBefore: receiverBalanceBefore,
      balanceAfter: receiverBalanceAfter,
      description: `Received from ${sender.phone}`
    });

    await session.commitTransaction();
    session.endSession();

    return { senderWallet, receiverWallet, fee };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
}




//  NEW: Agent Cash In
export async function cashIn(agentId: string, userPhone: string, amount: number) {
 
  const session = await mongoose.startSession();
  session.startTransaction();

  try {

    const agent = await User.findById(agentId).session(session);
    const user = await User.findOne({ phone: userPhone }).session(session);
    
    if (!agent || agent.role !== 'agent') throw new Error("Agent not found");
    if (!user) throw new Error("User not found");
    if (!agent.isApproved) throw new Error("Agent not approved");

    const userWallet = await Wallet.findOne({ user: user._id }).session(session);
    const agentWallet = await Wallet.findOne({ user: agent._id }).session(session);

    if (!userWallet || !agentWallet) throw new Error("Wallet not found");
    if (userWallet.isBlocked) throw new Error("User wallet is blocked");

    // Check agent has sufficient balance
    if (agentWallet.balance < amount) throw new Error("Agent has insufficient balance");

    const userBalanceBefore = userWallet.balance;
    userWallet.balance += amount;
    const userBalanceAfter = userWallet.balance;

    const agentBalanceBefore = agentWallet.balance;
    agentWallet.balance -= amount;
    const agentBalanceAfter = agentWallet.balance;

    await userWallet.save({ session });
    await agentWallet.save({ session });

    // Calculate commission (1.5% of amount)
    const commission = amount * (agent.commissionRate / 100);

    // CREATE TRANSACTION RECORDS
    await createTransaction({
      from: agent._id,
      to: user._id,
      amount,
      type: TransactionType.CASH_IN,
      initiatedBy: agent._id,
      balanceBefore: userBalanceBefore,
      balanceAfter: userBalanceAfter,
      description: `Cash-in by agent ${agent.phone}`
    });

    await createTransaction({
      from: agent._id,
      to: agent._id,
      amount,
      type: TransactionType.WITHDRAW,
      initiatedBy: agent._id,
      balanceBefore: agentBalanceBefore,
      balanceAfter: agentBalanceAfter,
      description: `Cash-in to user ${user.phone}`
    });

    // Commission transaction
    if (commission > 0) {
      agentWallet.balance += commission;
      await agentWallet.save({ session });

      await createTransaction({
        from: user._id, // System commission from user
        to: agent._id,
        amount: commission,
        type: TransactionType.COMMISSION,
        initiatedBy: agent._id,
        balanceBefore: agentBalanceAfter,
        balanceAfter: agentBalanceAfter + commission,
        description: `Commission for cash-in`
      });
    }

    await session.commitTransaction();
    session.endSession();

    return { userWallet, agentWallet, commission };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
}





//  NEW: Agent Cash Out
export async function cashOut(agentId: string, userPhone: string, amount: number) {

  const session = await mongoose.startSession();
  session.startTransaction();

  try {

    const agent = await User.findById(agentId).session(session);
    const user = await User.findOne({ phone: userPhone }).session(session);
    
    if (!agent || agent.role !== 'agent') throw new Error("Agent not found");
    if (!user) throw new Error("User not found");
    if (!agent.isApproved) throw new Error("Agent not approved");

    const userWallet = await Wallet.findOne({ user: user._id }).session(session);
    const agentWallet = await Wallet.findOne({ user: agent._id }).session(session);

    if (!userWallet || !agentWallet) throw new Error("Wallet not found");
    if (userWallet.isBlocked) throw new Error("User wallet is blocked");

    // Check user has sufficient balance
    if (userWallet.balance < amount) throw new Error("User has insufficient balance");

    const userBalanceBefore = userWallet.balance;
    userWallet.balance -= amount;
    const userBalanceAfter = userWallet.balance;

    const agentBalanceBefore = agentWallet.balance;
    agentWallet.balance += amount;
    const agentBalanceAfter = agentWallet.balance;

    await userWallet.save({ session });
    await agentWallet.save({ session });

    // Calculate commission (1.5% of amount)
    const commission = amount * (agent.commissionRate / 100);

    // CREATE TRANSACTION RECORDS
    await createTransaction({
      from: user._id,
      to: agent._id,
      amount,
      type: TransactionType.CASH_OUT,
      initiatedBy: agent._id,
      balanceBefore: userBalanceBefore,
      balanceAfter: userBalanceAfter,
      description: `Cash-out by agent ${agent.phone}`
    });

    await createTransaction({
      from: user._id,
      to: agent._id,
      amount,
      type: TransactionType.DEPOSIT,
      initiatedBy: agent._id,
      balanceBefore: agentBalanceBefore,
      balanceAfter: agentBalanceAfter,
      description: `Cash-out from user ${user.phone}`
    });

    // Commission transaction
    if (commission > 0) {
      // Deduct commission from user
      userWallet.balance -= commission;
      await userWallet.save({ session });

      await createTransaction({
        from: user._id,
        to: agent._id,
        amount: commission,
        type: TransactionType.COMMISSION,
        initiatedBy: agent._id,
        balanceBefore: userBalanceAfter,
        balanceAfter: userBalanceAfter - commission,
        description: `Commission for cash-out`
      });
    }

    await session.commitTransaction();
    session.endSession();

    return { userWallet, agentWallet, commission };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
}




// src/modules/wallet/wallet.service.ts
export async function cashOutToAgent(userId: string, agentPhone: string, amount: number) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(userId).session(session);
    const agent = await User.findOne({ phone: agentPhone, role: UserRole.AGENT }).session(session);
    
    if (!user) throw new Error("User not found");
    if (!agent) throw new Error("Agent not found");
    if (!agent.isApproved) throw new Error("Agent is not approved");

    const userWallet = await Wallet.findOne({ user: user._id }).session(session);
    const agentWallet = await Wallet.findOne({ user: agent._id }).session(session);

    if (!userWallet || !agentWallet) throw new Error("Wallet not found");
    if (userWallet.isBlocked) throw new Error("Your wallet is blocked");
    if (agentWallet.isBlocked) throw new Error("Agent wallet is blocked");

    // Calculate commission
    const commission = amount * (agent.commissionRate / 100);
    const totalDeduction = amount + commission;

    if (userWallet.balance < totalDeduction) {
      throw new Error(`Insufficient balance. Required: ${totalDeduction} (including ${commission} commission)`);
    }

    // Record initial balances
    const userInitialBalance = userWallet.balance;
    const agentInitialBalance = agentWallet.balance;

    // STEP 1: Transfer main amount (user → agent)
    userWallet.balance -= amount;
    agentWallet.balance += amount;

    await userWallet.save({ session });
    await agentWallet.save({ session });

    const userBalanceAfterAmountTransfer = userWallet.balance;
    const agentBalanceAfterAmountTransfer = agentWallet.balance;

    // STEP 2: Deduct commission (user → agent)
    let commissionTransaction = null;
    if (commission > 0) {
      userWallet.balance -= commission;
      agentWallet.balance += commission;
      
      await userWallet.save({ session });
      await agentWallet.save({ session });

      // Record commission transaction
      commissionTransaction = await createTransaction({
        from: user._id,
        to: agent._id,
        amount: commission,
        type: TransactionType.COMMISSION,
        initiatedBy: user._id,
        balanceBefore: userBalanceAfterAmountTransfer,
        balanceAfter: userWallet.balance,
        description: `Commission for cash-out: ${commission}৳`
      });
    }

    // STEP 3: Record main cash-out transaction
    const mainTransaction = await createTransaction({
      from: user._id,
      to: agent._id,
      amount: amount,
      fee: commission,
      type: TransactionType.CASH_OUT,
      initiatedBy: user._id,
      balanceBefore: userInitialBalance,
      balanceAfter: userWallet.balance,
      description: `Cash-out to agent ${agent.phone}`
    });

    
    // STEP 4: Record agent receiving transaction
    await createTransaction({
      from: user._id,
      to: agent._id,
      amount: amount,
      type: TransactionType.DEPOSIT,
      initiatedBy: user._id,
      balanceBefore: agentInitialBalance,
      balanceAfter: agentWallet.balance,
      description: `Cash-out from user ${user.phone}`
    });

    await session.commitTransaction();
    session.endSession();

    return { 
      userWallet, 
      agentWallet, 
      commission, 
      agent: { phone: agent.phone, name: agent.name },
      transaction: mainTransaction
    };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
}







//  NEW: Get wallet balance
export async function getWalletBalance(userId: string) {
  const wallet = await Wallet.findOne({ user: userId });
  if (!wallet) throw new Error("Wallet not found");
  
  return {
    balance: wallet.balance,
    isBlocked: wallet.isBlocked,
    user: wallet.user
  };
}



export const initiateTopUpService = async (userId: string, amount: number) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  // Validate minimum amount
  if (amount < 10) {
    throw new Error("Minimum top-up amount is ৳10");
  }

  // Use the payment service to initiate SSL Commerz payment
  const paymentResult = await initiateAddMoney(userId, amount);

  return paymentResult;
};