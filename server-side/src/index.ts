import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { testConnection, closePool } from "./config/database";
import routes from "./routes";
import {
  requestLogger,
  errorHandler,
  notFoundHandler,
} from "./middleware/index";
import { logger } from "./utils/index";

/**
 * Main server application
 */
class TimesheetServer {
  private app: Application;
  private isRunning: boolean = false;
  private port: number;
  private server: any;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || "3000", 10);
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  /**
   * Setup Express middleware
   */
  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet());

    // CORS configuration
    this.app.use(
      cors({
        origin: process.env.CORS_ORIGIN || "*",
        credentials: true,
      }),
    );

    // Compression middleware
    this.app.use(compression());

    // Body parsing middleware
    this.app.use(express.json({ limit: "10mb" }));
    this.app.use(express.urlencoded({ extended: true, limit: "10mb" }));

    // Request logging
    this.app.use(requestLogger);
  }

  /**
   * Setup application routes
   */
  private setupRoutes(): void {
    // Mount all routes
    this.app.use("/", routes);
  }

  /**
   * Setup error handling middleware
   */
  private setupErrorHandling(): void {
    // 404 handler
    this.app.use(notFoundHandler);

    // Global error handler
    this.app.use(errorHandler);
  }

  /**
   * Initialize and start the server
   */
  async start(): Promise<void> {
    try {
      logger.info("🚀 Starting Timesheet Database Server...");
      logger.info("=".repeat(50));

      // Test database connection
      const connectionSuccess = await testConnection();

      if (!connectionSuccess) {
        throw new Error("Failed to establish database connection");
      }

      // Start Express server
      this.server = this.app.listen(this.port, () => {
        this.isRunning = true;
        logger.info("=".repeat(50));
        logger.info("✨ Server is ready!");
        logger.info(`🌐 Server running on port ${this.port}`);
        logger.info(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
        logger.info(`🔗 API Base URL: http://localhost:${this.port}/api`);
        logger.info(`💚 Health Check: http://localhost:${this.port}/health`);
        logger.info("=".repeat(50));
      });

      // Setup graceful shutdown
      this.setupGracefulShutdown();
    } catch (error) {
      logger.error("❌ Failed to start server:", error);
      await this.shutdown();
      process.exit(1);
    }
  }

  /**
   * Setup graceful shutdown handlers
   */
  private setupGracefulShutdown(): void {
    const shutdownHandler = async (signal: string) => {
      logger.info(`\n⚠️  Received ${signal}, shutting down gracefully...`);
      await this.shutdown();
      process.exit(0);
    };

    process.on("SIGTERM", () => shutdownHandler("SIGTERM"));
    process.on("SIGINT", () => shutdownHandler("SIGINT"));

    // Handle uncaught errors
    process.on("uncaughtException", async (error) => {
      logger.error("💥 Uncaught Exception:", error);
      await this.shutdown();
      process.exit(1);
    });

    process.on("unhandledRejection", async (reason, promise) => {
      logger.error("💥 Unhandled Rejection:", { reason, promise });
      await this.shutdown();
      process.exit(1);
    });
  }

  /**
   * Shutdown the server and close database connections
   */
  async shutdown(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    logger.info("🛑 Shutting down server...");

    try {
      // Close Express server
      if (this.server) {
        await new Promise<void>((resolve, reject) => {
          this.server.close((err: Error) => {
            if (err) reject(err);
            else resolve();
          });
        });
      }

      // Close database connections
      await closePool();

      this.isRunning = false;
      logger.info("✅ Server shutdown complete");
    } catch (error) {
      logger.error("❌ Error during shutdown:", error);
    }
  }

  /**
   * Check if server is running
   */
  isServerRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Get Express application instance
   */
  getApp(): Application {
    return this.app;
  }
}

// Start the server if this file is run directly
if (require.main === module) {
  const server = new TimesheetServer();
  server.start().catch((error) => {
    logger.error("Fatal error:", error);
    process.exit(1);
  });
}

export default TimesheetServer;
