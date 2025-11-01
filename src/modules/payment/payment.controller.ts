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
    const userId = (req as any).user.sub;
    const { amount } = req.body;
    console.log(amount);

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be positive",
      });
    }

    const result = await initiateAddMoney(userId, amount);

    res.status(200).json({
      success: true,
      message: "Payment initiated successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};




export const paymentSuccess = async (req: Request, res: Response) => {
  try {
    const { transactionId, amount } = req.query;

    const result = await handlePaymentSuccess(transactionId as string);

    // Redirect to frontend success page
    

    const redirectUrl = `${env.SSL.FRONTEND_SUCCESS_URL}?transactionId=${transactionId}&amount=${amount}&status=success&message=${encodeURIComponent(result.message)}`;


    return res.redirect(redirectUrl);
  } catch (error: any) {
    const redirectUrl = `${process.env.SSL_FRONTEND_FAIL_URL}?status=fail&message=${encodeURIComponent(error.message)}`;
    return res.redirect(redirectUrl);
  }
};





export const paymentFail = async (req: Request, res: Response) => {
  try {
    const { transactionId } = req.query;

    await handlePaymentFailure(transactionId as string);

    const redirectUrl = `${env.SSL.FRONTEND_FAIL_URL}?transactionId=${transactionId}&status=fail&message=${encodeURIComponent("Payment failed")}`;

    return res.redirect(redirectUrl);
  } catch (error: any) {
    const redirectUrl = `${process.env.SSL_FRONTEND_FAIL_URL}?status=fail&message=${encodeURIComponent(error.message)}`;
    return res.redirect(redirectUrl);
  }
};




export const paymentCancel = async (req: Request, res: Response) => {
  try {
    const { transactionId } = req.query;

    await handlePaymentCancel(transactionId as string);

    const redirectUrl = `${env.SSL.FRONTEND_CANCEL_URL}?transactionId=${transactionId}&status=cancel&message=${encodeURIComponent("Payment cancelled")}`;

    return res.redirect(redirectUrl);
  } catch (error: any) {
    const redirectUrl = `${process.env.SSL_FRONTEND_FAIL_URL}?status=fail&message=${encodeURIComponent(error.message)}`;
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