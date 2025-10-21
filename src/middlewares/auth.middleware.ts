import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      auth?: {
        sub: string;
        role: "admin" | "user" | "agent";
      };
    }
  }
}

/**
 * ✅ Verify JWT from Cookie and attach decoded info to req.auth
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    // 🍪 Read token from cookies
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET not configured");

    const decoded = jwt.verify(token, secret) as JwtPayload;

    req.auth = {
      sub: decoded.sub as string,
      role: decoded.role as "admin" | "user" | "agent",
    };

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

/**
 * ✅ Restrict route access by role
 */
export const requireRole =
  (...allowedRoles: Array<"admin" | "user" | "agent">) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { role } = req.auth;
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ success: false, message: "Forbidden: Access denied" });
    }

    next();
  };
