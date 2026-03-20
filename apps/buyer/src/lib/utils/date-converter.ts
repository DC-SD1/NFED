/**
 * Utility functions for converting API datetime values to application-expected formats
 */

/**
 * Safely converts an API datetime value to Unix timestamp in milliseconds
 * 
 * @param value - The value to convert (expected to be ISO datetime string or already a number)
 * @returns Unix timestamp in milliseconds
 * @throws Error if the value cannot be converted to a valid timestamp
 * 
 * @example
 * ```typescript
 * // ISO string from API
 * parseApiDateTime('2025-06-22T18:12:54.345454Z') // returns 1750615974345
 * 
 * // Already a number (pass-through)
 * parseApiDateTime(1750615974345) // returns 1750615974345
 * 
 * // Invalid input
 * parseApiDateTime('invalid') // throws Error
 * ```
 */
export function parseApiDateTime(value: unknown): number {
  // If it's already a number, validate and return it
  if (typeof value === 'number') {
    if (isNaN(value) || value <= 0) {
      throw new Error(`Invalid timestamp number: ${value}`);
    }
    return value;
  }

  // If it's a string, try to parse as ISO datetime
  if (typeof value === 'string') {
    // Basic validation for ISO format
    if (!value.trim()) {
      throw new Error('Empty datetime string provided');
    }

    const date = new Date(value);
    const timestamp = date.getTime();

    // Check if the date is valid
    if (isNaN(timestamp)) {
      throw new Error(`Invalid datetime string: ${value}`);
    }

    // Additional validation: ensure it's a reasonable timestamp
    // (after year 2000 and before year 2100)
    const minTimestamp = new Date('2000-01-01').getTime();
    const maxTimestamp = new Date('2100-01-01').getTime();
    
    if (timestamp < minTimestamp || timestamp > maxTimestamp) {
      throw new Error(`Timestamp out of reasonable range: ${value} (${timestamp})`);
    }

    return timestamp;
  }

  // Handle null/undefined/other types
  throw new Error(`Cannot convert ${typeof value} to timestamp: ${String(value)}`);
}

/**
 * Type-safe wrapper for parseApiDateTime that returns null instead of throwing
 * Useful for optional datetime fields
 * 
 * @param value - The value to convert
 * @returns Unix timestamp in milliseconds or null if conversion fails
 */
export function safeParseApiDateTime(value: unknown): number | null {
  try {
    return parseApiDateTime(value);
  } catch {
    return null;
  }
}

/**
 * Converts Unix timestamp back to ISO string for API requests
 * 
 * @param timestamp - Unix timestamp in milliseconds
 * @returns ISO datetime string
 */
export function timestampToISOString(timestamp: number): string {
  if (!timestamp || isNaN(timestamp) || timestamp <= 0) {
    throw new Error(`Invalid timestamp: ${timestamp}`);
  }
  
  return new Date(timestamp).toISOString();
}