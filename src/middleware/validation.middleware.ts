import { Request, Response, NextFunction } from 'express';

/**
 * Simple email validation
 */
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validation middleware for user registration
 */
export const validateRegistration = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { email, password, fullName } = req.body;

  if (!email || !password || !fullName) {
    res.status(400).json({
      success: false,
      message: 'Email, password, and fullName are required',
    });
    return;
  }

  if (!isValidEmail(email)) {
    res.status(400).json({
      success: false,
      message: 'Invalid email format',
    });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters long',
    });
    return;
  }

  next();
};

/**
 * Validation middleware for user login
 */
export const validateLogin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({
      success: false,
      message: 'Email and password are required',
    });
    return;
  }

  if (!isValidEmail(email)) {
    res.status(400).json({
      success: false,
      message: 'Invalid email format',
    });
    return;
  }

  next();
};

/**
 * Validation middleware for image upload
 * Checks if file is present in the request
 */
export const validateImageUpload = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.file) {
    res.status(400).json({
      success: false,
      message: 'Image file is required',
    });
    return;
  }
  next();
};
