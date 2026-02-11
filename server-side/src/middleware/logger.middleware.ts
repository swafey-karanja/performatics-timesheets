import { Request, Response, NextFunction } from "express";

/**
 * Request logging middleware
 * Logs incoming requests with timestamp, method, URL, and response time
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const start = Date.now();
  const timestamp = new Date().toISOString();

  // Log request
  console.log(`[${timestamp}] ${req.method} ${req.url}`);

  // Log response when finished
  res.on("finish", () => {
    const duration = Date.now() - start;
    const statusColor = res.statusCode >= 400 ? "\x1b[31m" : "\x1b[32m"; // Red for errors, green for success
    const resetColor = "\x1b[0m";

    console.log(
      `[${timestamp}] ${req.method} ${req.url} ${statusColor}${res.statusCode}${resetColor} - ${duration}ms`,
    );
  });

  next();
};
