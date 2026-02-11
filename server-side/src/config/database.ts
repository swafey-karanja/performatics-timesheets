import { Pool, PoolConfig } from "pg";
import * as dotenv from "dotenv";

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
export const closePool = async (): Promise<void> => {
  await pool.end();
  console.log("Database pool closed");
};
