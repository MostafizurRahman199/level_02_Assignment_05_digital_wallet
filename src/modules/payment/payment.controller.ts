// modules/payment/payment.controllers.ts

import { Request, Response } from "express";
import {
  initiateAddMoney,
  handlePaymentSuccess,
  handlePaymentFailure,
  handlePaymentCancel,
  getPaymentHistory,
} from "./payment.service";
import { env } from "../../config/env";
import { SSLService } from "./sslCommerz.service";

export const initiateAddMoneyController = async (req: Request, res: Response) => {
  try {
    console.log("💰 Initiate Add Money Request Received");
    const userId = (req as any).user.sub;
    const { amount } = req.body;
    console.log("   - User ID:", userId);
    console.log("   - Amount:", amount);

    if (!amount || amount <= 0) {
      console.log("❌ Invalid amount:", amount);
      return res.status(400).json({
        success: false,
        message: "Amount must be positive",
      });
    }

    console.log("⏳ Calling initiateAddMoney service...");
    const result = await initiateAddMoney(userId, amount);
    console.log("✅ Payment Initiation Result:", result);

    res.status(200).json({
      success: true,
      message: "Payment initiated successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("❌ Payment Initiation Error:", error.message);
    console.error("   - Stack:", error.stack);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const paymentSuccess = async (req: Request, res: Response) => {
  try {
    console.log("✅ Payment Success Callback Received");
    const { transactionId, amount } = req.query;
    console.log("   - transactionId:", transactionId);
    console.log("   - amount:", amount);

    console.log("⏳ Processing payment success...");
    const result = await handlePaymentSuccess(transactionId as string);
    console.log("   - Payment processed:", result);

    const redirectUrl = `${env.SSL.FRONTEND_SUCCESS_URL}?transactionId=${transactionId}&amount=${amount}&status=success&message=${encodeURIComponent(result.message)}`;
    console.log("🔀 Redirecting to frontend:", redirectUrl);

    return res.redirect(redirectUrl);
  } catch (error: any) {
    console.error("❌ Payment Success Handler Error:", error.message);
    const redirectUrl = `${env.SSL.FRONTEND_FAIL_URL}?status=fail&message=${encodeURIComponent(error.message)}`;
    console.log("🔀 Redirecting to fail page:", redirectUrl);
    return res.redirect(redirectUrl);
  }
};

export const paymentFail = async (req: Request, res: Response) => {
  try {
    console.log("❌ Payment Fail Callback Received");
    const { transactionId } = req.query;
    console.log("   - transactionId:", transactionId);

    await handlePaymentFailure(transactionId as string);

    const redirectUrl = `${env.SSL.FRONTEND_FAIL_URL}?transactionId=${transactionId}&status=fail&message=${encodeURIComponent("Payment failed")}`;
    console.log("🔀 Redirecting to frontend fail page:", redirectUrl);

    return res.redirect(redirectUrl);
  } catch (error: any) {
    console.error("❌ Payment Fail Handler Error:", error.message);
    const redirectUrl = `${env.SSL.FRONTEND_FAIL_URL}?status=fail&message=${encodeURIComponent(error.message)}`;
    return res.redirect(redirectUrl);
  }
};

export const paymentCancel = async (req: Request, res: Response) => {
  try {
    console.log("⛔ Payment Cancel Callback Received");
    const { transactionId } = req.query;
    console.log("   - transactionId:", transactionId);

    await handlePaymentCancel(transactionId as string);

    const redirectUrl = `${env.SSL.FRONTEND_CANCEL_URL}?transactionId=${transactionId}&status=cancel&message=${encodeURIComponent("Payment cancelled")}`;
    console.log("🔀 Redirecting to frontend cancel page:", redirectUrl);

    return res.redirect(redirectUrl);
  } catch (error: any) {
    console.error("❌ Payment Cancel Handler Error:", error.message);
    const redirectUrl = `${env.SSL.FRONTEND_FAIL_URL}?status=fail&message=${encodeURIComponent(error.message)}`;
    return res.redirect(redirectUrl);
  }
};

export const getPaymentHistoryController = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.sub;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await getPaymentHistory(userId, page, limit);

    res.status(200).json({
      success: true,
      message: "Payment history fetched successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const validatePayment = async (req: Request, res: Response) => {
  try {
    const { val_id } = req.body;

    const result = await SSLService.validatePayment(val_id);

    res.status(200).json({
      success: true,
      message: "Payment validated successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
