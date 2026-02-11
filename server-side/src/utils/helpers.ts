/**
 * Utility functions for the application
 */

/**
 * Format date to YYYY-MM-DD
 */
export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Format time to HH:MM:SS
 */
export const formatTime = (date: Date): string => {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
};

/**
 * Calculate hours between two time strings
 */
export const calculateHours = (checkIn: string, checkOut: string): number => {
  const [inHours, inMinutes] = checkIn.split(":").map(Number);
  const [outHours, outMinutes] = checkOut.split(":").map(Number);

  const inTotalMinutes = inHours * 60 + inMinutes;
  const outTotalMinutes = outHours * 60 + outMinutes;

  return (outTotalMinutes - inTotalMinutes) / 60;
};

/**
 * Check if a value is a valid email
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Sanitize string input
 */
export const sanitizeString = (str: string): string => {
  return str.trim().replace(/\s+/g, " ");
};

/**
 * Generate username from name
 */
export const generateUsername = (name: string): string => {
  const parts = name.toLowerCase().split(" ");
  if (parts.length === 1) {
    return parts[0];
  }
  return `${parts[0][0]}${parts[parts.length - 1]}`;
};

/**
 * Parse pagination parameters
 */
export const parsePagination = (page?: string, limit?: string) => {
  const parsedPage = parseInt(page || "1", 10);
  const parsedLimit = parseInt(limit || "10", 10);

  return {
    page: parsedPage > 0 ? parsedPage : 1,
    limit: parsedLimit > 0 && parsedLimit <= 100 ? parsedLimit : 10,
    offset: (parsedPage - 1) * parsedLimit,
  };
};

/**
 * Sleep function for delays
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Deep clone an object
 */
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Check if object is empty
 */
export const isEmpty = (obj: object): boolean => {
  return Object.keys(obj).length === 0;
};

/**
 * Remove undefined values from object
 */
export const removeUndefined = <T extends object>(obj: T): Partial<T> => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value !== undefined),
  ) as Partial<T>;
};
