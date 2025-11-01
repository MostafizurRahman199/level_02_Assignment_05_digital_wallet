export interface ISSLCommerz {
  amount: number;
  transactionId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface IPaymentSuccessResponse {
  success: boolean;
  message: string;
  transactionId: string;
  amount: number;
}