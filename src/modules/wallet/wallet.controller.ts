import { Request, Response } from "express";
import { addMoney, withdrawMoney, sendMoney } from "./wallet.service";

export async function deposit(req: Request, res: Response) {
  try {
    const wallet = await addMoney(req.auth!.sub, req.body.amount);
    res.status(200).json({ success: true, wallet });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function withdraw(req: Request, res: Response) {
  try {
    const wallet = await withdrawMoney(req.auth!.sub, req.body.amount);
    res.status(200).json({ success: true, wallet });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function transfer(req: Request, res: Response) {
  try {
    const { receiverPhone, amount } = req.body;
    const result = await sendMoney(req.auth!.sub, receiverPhone, amount);
    res.status(200).json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
}
