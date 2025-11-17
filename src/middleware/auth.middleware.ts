import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.util';

// Extend Express Request type to include userId
declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

/**
 * Authentication middleware to verify JWT tokens
 * Extracts token from Authorization header, verifies it, and attaches userId to request
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        success: false,
        message: 'Authorization header missing',
      });
      return;
    }

    // Check if header follows Bearer token format
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      res.status(401).json({
        success: false,
        message: 'Invalid authorization header format. Expected: Bearer <token>',
      });
      return;
    }

    const token = parts[1];

    // Verify token and extract userId
    const { userId } = verifyToken(token);

    // Attach userId to request object
    req.userId = userId;

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error instanceof Error ? error.message : 'Authentication failed',
    });
  }
};
