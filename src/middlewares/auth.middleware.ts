import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { UserRole } from "../modules/auth/auth.interface";

// Extend Express Request type with enhanced auth info
declare global {
  namespace Express {
    interface Request {
      user?: {
        sub: string;
        role: UserRole;
        isApproved?: boolean;
      };
    }
  }
}

/**
 * ✅ Verify JWT from Cookie/Header and attach decoded info to req.user
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    // 🍪 Read token from cookies or Authorization header
    let token = req.cookies?.token || req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized: No token provided" 
      });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET not configured");

    const decoded = jwt.verify(token, secret) as JwtPayload;

    // ✅ Enhanced user object with all necessary fields
    req.user = {
      sub: decoded.sub as string,
      role: decoded.role as UserRole,
      isApproved: decoded.isApproved as boolean
    };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({ 
      success: false, 
      message: "Invalid or expired token" 
    });
  }
};

/**
 * ✅ Restrict route access by role with agent approval check
 */
export const requireRole =
  (...allowedRoles: UserRole[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized: Authentication required" 
      });
    }

    const { role, isApproved } = req.user;
    
    // Check if user role is allowed
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ 
        success: false, 
        message: "Forbidden: Insufficient permissions" 
      });
    }

    // Additional check for agents - must be approved
    if (role === UserRole.AGENT && !isApproved) {
      return res.status(403).json({ 
        success: false, 
        message: "Forbidden: Agent account pending approval" 
      });
    }

    next();
  };

/**
 * ✅ Optional: Middleware to check if user is active (not blocked)
 * This can be used in routes where even authenticated users might be blocked
 */
export const requireActiveUser = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: "Unauthorized" 
    });
  }

  // Note: Actual user active status should be checked in the service layer
  // This is just a placeholder for additional security checks
  next();
};

/**
 * ✅ Middleware specifically for agent approval check
 * Useful for routes that both users and agents can access but agents need approval
 */
export const requireApprovedAgent = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: "Unauthorized" 
    });
  }

  if (req.user.role === UserRole.AGENT && !req.user.isApproved) {
    return res.status(403).json({ 
      success: false, 
      message: "Agent account pending admin approval" 
    });
  }

  next();
};