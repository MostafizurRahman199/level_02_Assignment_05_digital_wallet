
// src/utils/jwt.ts
import jwt, { Secret, SignOptions, JwtPayload } from "jsonwebtoken";
import { UserRole } from "../modules/auth/auth.interface";

// ✅ Environment setup (safe fallback)
const JWT_SECRET: Secret = process.env.JWT_SECRET || "default_secret_key";
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || "7d";

/**
 * Interface for JWT Payload
 */
export interface JWTPayload extends JwtPayload {
  sub: string; // user id
  role: UserRole;
}

// ✅ Generate JWT Token
export const generateToken = (payload: JWTPayload): string => {
  const options: SignOptions = {
    expiresIn: JWT_EXPIRES_IN as unknown as SignOptions['expiresIn'],
  };

  return jwt.sign(payload, JWT_SECRET, options);
};

// ✅ Verify and decode JWT Token
export const verifyToken = (token: string): JWTPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};
