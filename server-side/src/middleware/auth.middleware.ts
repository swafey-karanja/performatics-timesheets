import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { JwtPayload, UserRole } from "../types/types";

// Extend Express Request to carry the decoded user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Protect routes — validates Bearer token
 */
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      message: "Access token is required",
    });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error: any) {
    const message =
      error.name === "TokenExpiredError"
        ? "Access token has expired"
        : "Invalid access token";

    res.status(401).json({ success: false, message });
  }
};

/**
 * Optional: restrict to Active accounts only (redundant if login already checks,
 * but useful for routes that need a re-check mid-session)
 */
export const requireActive = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (req.user?.status !== "Active") {
    res.status(403).json({
      success: false,
      message: "Account is suspended",
    });
    return;
  }
  next();
};

/**
 * Authorize by role(s).
 * Always use AFTER authenticate.
 *
 * Usage:
 *   router.delete('/:id', authenticate, authorize('Admin'), handler)
 *   router.put('/:id',    authenticate, authorize('Admin', 'Manager'), handler)
 */
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Access denied. Required role(s): ${allowedRoles.join(", ")}`,
      });
      return;
    }

    next();
  };
};
