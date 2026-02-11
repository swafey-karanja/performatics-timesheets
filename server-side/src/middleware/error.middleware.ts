import { Request, Response, NextFunction } from "express";

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error response interface
 */
interface ErrorResponse {
  status: "error";
  statusCode: number;
  message: string;
  stack?: string;
}

/**
 * Global error handling middleware
 * Handles all errors thrown in the application
 */
export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  let statusCode = 500;
  let message = "Internal Server Error";
  let isOperational = false;

  // Check if error is an instance of ApiError
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = err.isOperational;
  } else {
    message = err.message || message;
  }

  // Log error
  console.error("Error:", {
    statusCode,
    message,
    isOperational,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  // Prepare error response
  const errorResponse: ErrorResponse = {
    status: "error",
    statusCode,
    message,
  };

  // Include stack trace in development
  if (process.env.NODE_ENV === "development") {
    errorResponse.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * Not found middleware
 * Handles 404 errors for undefined routes
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const error = new ApiError(404, `Route not found: ${req.method} ${req.url}`);
  next(error);
};
