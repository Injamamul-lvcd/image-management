import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import multer from 'multer';

/**
 * Error response interface
 */
interface ErrorResponse {
  success: false;
  message: string;
  errors?: Array<{ field: string; message: string }>;
  stack?: string;
}

/**
 * Global error handling middleware
 * Catches all errors from routes and middleware, formats responses consistently
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Default error values
  let statusCode = 500;
  let message = 'Internal server error';
  let isOperational = false;

  // Handle AppError instances
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = err.isOperational;
  }
  // Handle Multer errors
  else if (err instanceof multer.MulterError) {
    statusCode = 400;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File size exceeds the maximum allowed limit';
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      message = 'Unexpected field in file upload';
    } else {
      message = err.message;
    }
    isOperational = true;
  }
  // Handle file filter errors from multer
  else if (err.message && err.message.includes('Invalid file type')) {
    statusCode = 400;
    message = err.message;
    isOperational = true;
  }
  // Handle Sequelize validation errors
  else if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = 'Validation error';
    isOperational = true;
  }
  // Handle Sequelize unique constraint errors
  else if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 400;
    message = 'Resource already exists';
    isOperational = true;
  }

  // Build error response
  const errorResponse: ErrorResponse = {
    success: false,
    message,
  };

  // Include stack trace in development mode
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }

  // Log error for debugging (in production, use proper logging service)
  if (!isOperational || statusCode === 500) {
    console.error('Error:', {
      message: err.message,
      stack: err.stack,
      statusCode,
    });
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * Middleware to handle 404 Not Found errors
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
  });
};
