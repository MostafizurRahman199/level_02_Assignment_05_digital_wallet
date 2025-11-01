import jwt, { Secret, SignOptions, JwtPayload } from "jsonwebtoken";
import { UserRole } from "../modules/auth/auth.interface";



// ✅ Import and load environment variables FIRST
import dotenv from "dotenv";
dotenv.config();

// ✅ Environment setup with proper typing
const JWT_SECRET: Secret = process.env.JWT_SECRET || "supersecretjwtkey";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// Debug logging
console.log("🔐 JWT Configuration:");
console.log("   - JWT_SECRET:", process.env.JWT_SECRET ? "✅ Loaded from environment" : "❌ Using fallback");
console.log("   - JWT_EXPIRES_IN:", JWT_EXPIRES_IN);

/**
 * Interface for JWT Payload
 */
export interface JWTPayload extends JwtPayload {
  sub: string; // user id
  role: UserRole;
  isApproved: boolean;
}

// ✅ Generate JWT Token
export const generateToken = (payload: JWTPayload): string => {
  const options: SignOptions = {
    expiresIn: JWT_EXPIRES_IN as SignOptions['expiresIn'], // ✅ Fixed type
  };

  console.log("🔄 Generating token with payload:", {
    sub: payload.sub,
    role: payload.role,
    isApproved: payload.isApproved
  });

  const token = jwt.sign(payload, JWT_SECRET, options);
  
  console.log("✅ Token generated successfully");
  console.log("   - Token:", token);
  
  return token;
};

// ✅ Verify and decode JWT Token
export const verifyToken = (token: string): JWTPayload => {
  try {
    if (!token) {
      throw new Error("Token is empty or undefined");
    }

    console.log("🔄 Verifying token...");
    console.log("   - Token length:", token.length);
    console.log("   - JWT_SECRET length:", JWT_SECRET.length);

    // Decode without verification first to check structure
    const decodedWithoutVerify = jwt.decode(token);
    console.log("   - Token structure:", decodedWithoutVerify ? "✅ Valid" : "❌ Invalid");

    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    
    console.log("✅ Token verified successfully");
    console.log("   - User ID:", decoded.sub);
    console.log("   - Role:", decoded.role);
    console.log("   - Expires:", new Date(decoded.exp! * 1000).toISOString());
    
    return decoded;
  } catch (error: any) {
    console.error("❌ Token verification failed:");
    console.error("   - Error:", error.message);
    console.error("   - Token used:", token);
    
    if (error.name === "TokenExpiredError") {
      throw new Error("Token has expired");
    } else if (error.name === "JsonWebTokenError") {
      throw new Error("Invalid token signature");
    } else {
      throw new Error("Invalid or expired token");
    }
  }
};

// ✅ Generate token from user object (convenience function)
export const generateTokenFromUser = (user: { _id: string; role: UserRole; isApproved: boolean }): string => {
  const payload: JWTPayload = {
    sub: user._id,
    role: user.role,
    isApproved: user.isApproved,
  };

  return generateToken(payload);
};

// ✅ Extract user ID from token
export const getUserIdFromToken = (token: string): string => {
  const decoded = verifyToken(token);
  return decoded.sub;
};

// ✅ Check if token is about to expire
export const isTokenExpiringSoon = (token: string, thresholdMinutes: number = 30): boolean => {
  try {
    const decoded = jwt.decode(token) as JWTPayload;
    if (!decoded.exp) return false;

    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = decoded.exp - now;
    return timeUntilExpiry < (thresholdMinutes * 60);
  } catch {
    return false;
  }
};

// ✅ NEW: Debug token utility
export const debugToken = (token: string) => {
  try {
    const decoded = jwt.decode(token);
    const verified = jwt.verify(token, JWT_SECRET);
    
    return {
      valid: true,
      decoded,
      verified,
      secretMatch: true
    };
  } catch (error: any) {
    return {
      valid: false,
      error: error.message,
      decoded: jwt.decode(token),
      secretMatch: false
    };
  }
};