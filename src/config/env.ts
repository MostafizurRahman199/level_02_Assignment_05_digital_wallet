import dotenv from "dotenv";

// Load environment variables FIRST
dotenv.config();

export const env = {
  // JWT
  JWT_SECRET: process.env.JWT_SECRET || "supersecretjwtkey",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  
  // Server
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  
  // Database
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/digital-wallet",
  
  // ✅ UPDATE SSL COMMERZ URLs to match your route structure
  SSL: {
    STORE_ID: process.env.SSL_STORE_ID || "world68c8339a98159",
    STORE_PASSWORD: process.env.SSL_STORE_PASSWORD || "world68c8339a98159@ssl",
    PAYMENT_API: process.env.SSL_PAYMENT_API || "https://sandbox.sslcommerz.com/gwprocess/v3/api.php",
    VALIDATION_API: process.env.SSL_VALIDATION_API || "https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php",
    
    // ✅ UPDATED: Match your /api/payments route structure
    BACKEND_SUCCESS_URL: process.env.SSL_BACKEND_SUCCESS_URL || "http://localhost:5000/api/payments/success",
    BACKEND_FAIL_URL: process.env.SSL_BACKEND_FAIL_URL || "http://localhost:5000/api/payments/fail", 
    BACKEND_CANCEL_URL: process.env.SSL_BACKEND_CANCEL_URL || "http://localhost:5000/api/payments/cancel",
    IPN_URL: process.env.SSL_IPN_URL || "http://localhost:5000/api/payments/validate",
    
    // Frontend URLs
    FRONTEND_SUCCESS_URL: process.env.SSL_FRONTEND_SUCCESS_URL || "http://localhost:3000/payment/success",
    FRONTEND_FAIL_URL: process.env.SSL_FRONTEND_FAIL_URL || "http://localhost:3000/payment/fail",
    FRONTEND_CANCEL_URL: process.env.SSL_FRONTEND_CANCEL_URL || "http://localhost:3000/payment/cancel",
  }
};

// Debug: Check if environment variables are loaded
console.log("🔐 Environment Configuration:");
console.log("   - JWT_SECRET:", process.env.JWT_SECRET ? "✅ Loaded" : "❌ Using fallback");
console.log("   - MONGODB_URI:", process.env.MONGODB_URI ? "✅ Loaded" : "❌ Using fallback");
console.log("   - PORT:", env.PORT);
console.log("   - SSL_STORE_ID:", process.env.SSL_STORE_ID ? "✅ Loaded" : "❌ Using fallback");
console.log("   - SSL_BACKEND_SUCCESS_URL:", env.SSL.BACKEND_SUCCESS_URL);