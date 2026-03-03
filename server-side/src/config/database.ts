import { Pool, PoolConfig, PoolClient, QueryResult, QueryResultRow } from "pg";
import * as dotenv from "dotenv";
import { logger } from "../utils/logger";

// Load environment variables
dotenv.config();

/**
 * Database configuration interface
 */
interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  max?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
}

/**
 * Load database configuration from environment variables
 */
const getDbConfig = (): DatabaseConfig => {
  const requiredEnvVars = [
    "DB_HOST",
    "DB_PORT",
    "DB_NAME",
    "DB_USER",
    "DB_PASSWORD",
  ];
  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName],
  );

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}\n` +
        "Please create a .env file based on .env.example",
    );
  }

  return {
    host: process.env.DB_HOST!,
    port: parseInt(process.env.DB_PORT!, 10),
    database: process.env.DB_NAME!,
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    max: process.env.DB_MAX_CONNECTIONS
      ? parseInt(process.env.DB_MAX_CONNECTIONS, 10)
      : 20,
    idleTimeoutMillis: process.env.DB_IDLE_TIMEOUT
      ? parseInt(process.env.DB_IDLE_TIMEOUT, 10)
      : 30000,
    connectionTimeoutMillis: process.env.DB_CONNECTION_TIMEOUT
      ? parseInt(process.env.DB_CONNECTION_TIMEOUT, 10)
      : 2000,
  };
};

/**
 * Create a new PostgreSQL connection pool
 */
const createPool = (): Pool => {
  const config = getDbConfig();

  const poolConfig: PoolConfig = {
    ...config,
    // Additional pool configuration
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
  };

  const pool = new Pool(poolConfig);

  // Handle pool errors
  pool.on("error", (err) => {
    console.error("Unexpected error on idle database client", err);
    process.exit(-1);
  });

  // Log successful connections (only in development)
  if (process.env.NODE_ENV === "development") {
    pool.on("connect", () => {
      console.log("✅ New database client connected to the pool");
    });
  }

  return pool;
};

// Create and export the pool instance
export const pool = createPool();

/**
 * Test database connection
 */
export const testConnection = async (): Promise<boolean> => {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT NOW()");
    console.log("✅ Database connected successfully at:", result.rows[0].now);
    client.release();
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return false;
  }
};

/**
 * Close all database connections
 */
let isPoolClosed = false;

export const closePool = async (): Promise<void> => {
  if (isPoolClosed) return; // 👈 prevents the second call from erroring
  isPoolClosed = true;

  await pool.end();
  logger.info("Database pool closed");
};

/**
 * Execute a callback function within a database transaction
 * Automatically handles BEGIN, COMMIT, and ROLLBACK
 *
 * @param callback - Function that performs database operations with the client
 * @returns Promise resolving to the callback's return value
 * @throws Will throw an error if the transaction fails
 *
 * @example
 * const result = await withTransaction(async (client) => {
 *   const user = await client.query('INSERT INTO users...');
 *   const account = await client.query('INSERT INTO accounts...');
 *   return { user, account };
 * });
 */
export async function withTransaction<T>(
  callback: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Transaction rolled back due to error:", error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Type-safe query helper that executes a query with optional parameters
 *
 * @param text - SQL query string
 * @param params - Optional array of query parameters
 * @returns Promise resolving to the query result
 *
 * @example
 * const result = await query<User>(
 *   'SELECT * FROM users WHERE id = $1',
 *   [userId]
 * );
 * const users = result.rows;
 */
export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[],
): Promise<QueryResult<T>> {
  const start = Date.now();
  try {
    const result = await pool.query<T>(text, params);
    const duration = Date.now() - start;

    // Log slow queries (> 1 second) in development
    if (process.env.NODE_ENV === "development" && duration > 1000) {
      console.warn(`⚠️  Slow query detected (${duration}ms):`, text);
    }

    return result;
  } catch (error) {
    console.error("Query error:", error);
    console.error("Query:", text);
    console.error("Params:", params);
    throw error;
  }
}

/**
 * Execute a query with a specific client (useful within transactions)
 *
 * @param client - The database client to use
 * @param text - SQL query string
 * @param params - Optional array of query parameters
 * @returns Promise resolving to the query result
 *
 * @example
 * await withTransaction(async (client) => {
 *   await queryWithClient(client, 'INSERT INTO users...', [name]);
 *   await queryWithClient(client, 'INSERT INTO accounts...', [userId]);
 * });
 */
export async function queryWithClient<T extends QueryResultRow = any>(
  client: PoolClient,
  text: string,
  params?: any[],
): Promise<QueryResult<T>> {
  try {
    return await client.query<T>(text, params);
  } catch (error) {
    console.error("Query error:", error);
    console.error("Query:", text);
    console.error("Params:", params);
    throw error;
  }
}

/**
 * Check if the database connection is healthy
 *
 * @returns Promise resolving to true if healthy, false otherwise
 */
export const isHealthy = async (): Promise<boolean> => {
  try {
    const result = await query("SELECT 1 as health_check");
    return result.rows.length > 0;
  } catch (error) {
    console.error("Database health check failed:", error);
    return false;
  }
};

/**
 * Get current pool statistics
 *
 * @returns Object containing pool statistics
 */
export const getPoolStats = () => {
  return {
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount,
  };
};

/**
 * Log pool statistics (useful for debugging)
 */
export const logPoolStats = (): void => {
  const stats = getPoolStats();
  console.log("📊 Database Pool Statistics:");
  console.log(`   Total connections: ${stats.totalCount}`);
  console.log(`   Idle connections: ${stats.idleCount}`);
  console.log(`   Waiting requests: ${stats.waitingCount}`);
};

// Graceful shutdown handlers
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, closing database pool...");
  await closePool();
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, closing database pool...");
  await closePool();
});
