import { Request, Response } from "express";
import { pool } from "../config/database";

/**
 * Health check controller
 */

/**
 * Basic health check
 * @route GET /health
 */
export const healthCheck = async (
  req: Request,
  res: Response,
): Promise<void> => {
  res.status(200).json({
    status: "success",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
};

/**
 * Detailed health check including database status
 * @route GET /health/detailed
 */
export const detailedHealthCheck = async (
  req: Request,
  res: Response,
): Promise<void> => {
  let dbStatus = "disconnected";
  let dbResponseTime = 0;

  try {
    const start = Date.now();
    await pool.query("SELECT 1");
    dbResponseTime = Date.now() - start;
    dbStatus = "connected";
  } catch (error) {
    dbStatus = "error";
  }

  res.status(200).json({
    status: "success",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: {
      status: dbStatus,
      responseTime: `${dbResponseTime}ms`,
    },
    memory: {
      used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
      total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
    },
    nodeVersion: process.version,
  });
};
