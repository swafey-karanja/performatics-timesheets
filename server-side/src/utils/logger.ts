/**
 * Logger utility for consistent logging across the application
 */

enum LogLevel {
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
  DEBUG = "DEBUG",
}

class Logger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === "development";
  }

  private formatMessage(level: LogLevel, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const metaString = meta ? ` | ${JSON.stringify(meta)}` : "";
    return `[${timestamp}] [${level}] ${message}${metaString}`;
  }

  private getColor(level: LogLevel): string {
    switch (level) {
      case LogLevel.INFO:
        return "\x1b[36m"; // Cyan
      case LogLevel.WARN:
        return "\x1b[33m"; // Yellow
      case LogLevel.ERROR:
        return "\x1b[31m"; // Red
      case LogLevel.DEBUG:
        return "\x1b[35m"; // Magenta
      default:
        return "\x1b[0m"; // Reset
    }
  }

  private log(level: LogLevel, message: string, meta?: any): void {
    const formattedMessage = this.formatMessage(level, message, meta);
    const color = this.getColor(level);
    const reset = "\x1b[0m";

    console.log(`${color}${formattedMessage}${reset}`);
  }

  info(message: string, meta?: any): void {
    this.log(LogLevel.INFO, message, meta);
  }

  warn(message: string, meta?: any): void {
    this.log(LogLevel.WARN, message, meta);
  }

  error(message: string, meta?: any): void {
    this.log(LogLevel.ERROR, message, meta);
  }

  debug(message: string, meta?: any): void {
    if (this.isDevelopment) {
      this.log(LogLevel.DEBUG, message, meta);
    }
  }
}

export const logger = new Logger();
