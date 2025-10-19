import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

// Extend Express Request type to include auth user info
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

// Verify JWT and attach user info to request
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Unauthorized: No token" });
    }

    const token = authHeader.split(" ")[1];
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

// Restrict access by roles (admin, user, agent)
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
