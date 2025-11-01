import qs from "qs";
import axios from "axios";
import { ISSLCommerz } from "./sslCommerz.interface";
import { env } from "../../config/env"; // ✅ Import from config

// ✅ Use centralized config
const SSL_STORE_ID = env.SSL.STORE_ID;
const SSL_STORE_PASSWORD = env.SSL.STORE_PASSWORD;
const SSL_PAYMENT_API = env.SSL.PAYMENT_API;
const SSL_VALIDATION_API = env.SSL.VALIDATION_API;

export const sslPaymentInit = async (payload: ISSLCommerz) => {
  const data = {
    store_id: SSL_STORE_ID,
    store_passwd: SSL_STORE_PASSWORD,
    total_amount: payload.amount,
    currency: "BDT",
    tran_id: payload.transactionId,
    
    success_url: `${env.SSL.BACKEND_SUCCESS_URL}?transactionId=${payload.transactionId}&amount=${payload.amount}&status=success`,
    fail_url: `${env.SSL.BACKEND_FAIL_URL}?transactionId=${payload.transactionId}&amount=${payload.amount}&status=fail`,
    cancel_url: `${env.SSL.BACKEND_CANCEL_URL}?transactionId=${payload.transactionId}&amount=${payload.amount}&status=cancel`,
    
    ipn_url: env.SSL.IPN_URL,
    emi_option: 0,
    
    cus_name: payload.name,
    cus_email: payload.email,
    cus_add1: payload.address,
    cus_phone: payload.phone,
    
    cus_add2: "N/A",
    cus_city: "Dhaka",
    cus_state: "Dhaka",
    cus_postcode: "1000",
    cus_country: "Bangladesh",
    
    product_name: "Wallet Top-up",
    product_category: "Service",
    product_profile: "general",
    
    shipping_method: "N/A",
    ship_name: "N/A",
    ship_add1: "N/A",
    ship_city: "N/A",
    ship_state: "N/A",
    ship_postcode: 1000,
    ship_country: "N/A",
  };

  try {
    const response = await axios.post(SSL_PAYMENT_API, qs.stringify(data), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    return response.data;
  } catch (error: any) {
    throw new Error(`SSLCommerz Init Failed: ${error.response?.data || error.message}`);
  }
};

export const validatePayment = async (val_id: string) => {
  try {
    const response = await axios.get(SSL_VALIDATION_API, {
      params: {
        val_id: val_id,
        store_id: SSL_STORE_ID,
        store_passwd: SSL_STORE_PASSWORD,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Payment validation failed:", error.message);
    throw new Error("Payment validation failed");
  }
};

export const SSLService = {
  sslPaymentInit,
  validatePayment
};