/**
 * Utility functions for converting API datetime values to application-expected formats
 */

// C# DateTime.MinValue in ticks (January 1, 0001 12:00:00 AM)
// eslint-disable-next-line unused-imports/no-unused-vars
const CSHARP_DATETIME_MIN_TICKS = 0;
// C# ticks per millisecond (10,000 ticks = 1 millisecond)
const TICKS_PER_MILLISECOND = 10000;
// C# epoch offset from Unix epoch (January 1, 1970 - January 1, 0001) in ticks
const CSHARP_EPOCH_OFFSET_TICKS = 621355968000000000;

/**
 * Converts C# ticks to Unix timestamp in milliseconds
 *
 * @param ticks - C# DateTime ticks
 * @returns Unix timestamp in milliseconds
 */
function convertCSharpTicksToUnixMs(ticks: number): number {
  // Convert C# ticks to Unix milliseconds
  // 1. Subtract the C# epoch offset to get ticks since Unix epoch
  // 2. Divide by ticks per millisecond
  const unixTicks = ticks - CSHARP_EPOCH_OFFSET_TICKS;
  return Math.floor(unixTicks / TICKS_PER_MILLISECOND);
}

/**
 * Detects and converts various timestamp formats to Unix milliseconds
 *
 * @param value - The numeric value to analyze
 * @returns Unix timestamp in milliseconds
 */
function detectAndConvertTimestamp(value: number): number {
  // Log the incoming value for debugging
  console.log("[date-converter] Detecting timestamp format for value:", value);

  // Check if it's already a reasonable Unix timestamp in milliseconds
  // (between year 2000 and 2100)
  const minUnixMs = new Date("2000-01-01").getTime();
  const maxUnixMs = new Date("2100-01-01").getTime();

  if (value >= minUnixMs && value <= maxUnixMs) {
    console.log("[date-converter] Detected as Unix milliseconds");
    return value;
  }

  // Check if it's Unix timestamp in seconds (smaller range)
  const minUnixSec = Math.floor(minUnixMs / 1000);
  const maxUnixSec = Math.floor(maxUnixMs / 1000);

  if (value >= minUnixSec && value <= maxUnixSec) {
    console.log(
      "[date-converter] Detected as Unix seconds, converting to milliseconds",
    );
    return value * 1000;
  }

  // Check if it's C# ticks (much larger numbers)
  // C# ticks for dates between 2000-2100 would be in this range
  const minCSharpTicks =
    CSHARP_EPOCH_OFFSET_TICKS + minUnixMs * TICKS_PER_MILLISECOND;
  const maxCSharpTicks =
    CSHARP_EPOCH_OFFSET_TICKS + maxUnixMs * TICKS_PER_MILLISECOND;

  if (value >= minCSharpTicks && value <= maxCSharpTicks) {
    console.log(
      "[date-converter] Detected as C# ticks, converting to Unix milliseconds",
    );
    const unixMs = convertCSharpTicksToUnixMs(value);
    console.log(
      "[date-converter] Converted C# ticks to Unix ms:",
      new Date(unixMs).toISOString(),
    );
    return unixMs;
  }

  // If the value is suspiciously large, it might be C# ticks even outside our range
  if (value > maxUnixMs * 1000) {
    console.log(
      "[date-converter] Value is very large, attempting C# ticks conversion",
    );
    const unixMs = convertCSharpTicksToUnixMs(value);
    const resultDate = new Date(unixMs);
    console.log(
      "[date-converter] C# ticks conversion result:",
      resultDate.toISOString(),
    );

    // Validate the result is reasonable
    if (unixMs >= minUnixMs && unixMs <= maxUnixMs) {
      return unixMs;
    }
  }

  // If we can't determine the format, throw an error with diagnostic info
  const diagnosticInfo = {
    value,
    asUnixMs: new Date(value).toISOString(),
    asUnixSec: new Date(value * 1000).toISOString(),
    asCSharpTicks: new Date(convertCSharpTicksToUnixMs(value)).toISOString(),
  };

  console.error(
    "[date-converter] Unable to determine timestamp format:",
    diagnosticInfo,
  );
  throw new Error(`Unable to determine timestamp format for value: ${value}`);
}

/**
 * Safely converts an API datetime value to Unix timestamp in milliseconds
 *
 * @param value - The value to convert (ISO string, Unix timestamp, or C# ticks)
 * @returns Unix timestamp in milliseconds
 * @throws Error if the value cannot be converted to a valid timestamp
 *
 * @example
 * ```typescript
 * // ISO string from API
 * parseApiDateTime('2025-06-22T18:12:54.345454Z') // returns 1750615974345
 *
 * // Unix timestamp in milliseconds
 * parseApiDateTime(1750615974345) // returns 1750615974345
 *
 * // Unix timestamp in seconds
 * parseApiDateTime(1750615974) // returns 1750615974000
 *
 * // C# ticks
 * parseApiDateTime(638549791743450000) // returns corresponding Unix ms
 *
 * // Invalid input
 * parseApiDateTime('invalid') // throws Error
 * ```
 */
export function parseApiDateTime(value: unknown): number {
  // Log the raw value for debugging
  console.log(
    "[date-converter] parseApiDateTime called with:",
    value,
    "type:",
    typeof value,
  );

  // If it's already a number, detect format and convert
  if (typeof value === "number") {
    if (isNaN(value) || value <= 0) {
      throw new Error(`Invalid timestamp number: ${value}`);
    }
    return detectAndConvertTimestamp(value);
  }

  // If it's a string, try multiple parsing strategies
  if (typeof value === "string") {
    // Basic validation
    if (!value.trim()) {
      throw new Error("Empty datetime string provided");
    }

    // First, check if it's a numeric string (timestamp)
    const numericValue = Number(value);
    if (!isNaN(numericValue) && numericValue > 0) {
      console.log(
        "[date-converter] String contains numeric value, parsing as timestamp",
      );
      return detectAndConvertTimestamp(numericValue);
    }

    // Try parsing as ISO datetime or other date formats
    const date = new Date(value);
    const timestamp = date.getTime();

    // Check if the date is valid
    if (isNaN(timestamp)) {
      // Try parsing custom formats that C# might send
      // Format: "DD/MM/YYYY, HH:mm:ss" (based on the error you described)
      const customFormatMatch = value.match(
        /^(\d{1,2})\/(\d{1,2})\/(\d+),\s*(\d{1,2}):(\d{2}):(\d{2})$/,
      );
      if (customFormatMatch) {
        const [, day, month, year, hour, minute, second] = customFormatMatch;
        console.log("[date-converter] Detected custom date format:", {
          day,
          month,
          year,
          hour,
          minute,
          second,
        });

        // If year is suspiciously large, it might be C# ticks misformatted
        if (year && parseInt(year) > 3000) {
          console.error(
            "[date-converter] Year value suggests corrupted date format, possibly C# ticks issue",
          );
          throw new Error(
            `Invalid date format - year ${year} suggests timestamp conversion issue. Raw value: "${value}"`,
          );
        }

        // Otherwise try to parse the custom format
        const customDate = new Date(
          year ? parseInt(year) : 0,
          month ? parseInt(month) - 1 : 0, // JavaScript months are 0-based
          day ? parseInt(day) : 0,
          hour ? parseInt(hour) : 0,
          minute ? parseInt(minute) : 0,
          second ? parseInt(second) : 0,
        );

        const customTimestamp = customDate.getTime();
        if (!isNaN(customTimestamp)) {
          return customTimestamp;
        }
      }

      throw new Error(
        `Invalid token expiry date: Unable to parse datetime string "${value}"`,
      );
    }

    // Additional validation: ensure it's a reasonable timestamp
    const minTimestamp = new Date("2000-01-01").getTime();
    const maxTimestamp = new Date("2100-01-01").getTime();

    if (timestamp < minTimestamp || timestamp > maxTimestamp) {
      console.error(
        "[date-converter] Parsed date is out of reasonable range:",
        {
          value,
          parsedDate: date.toISOString(),
          timestamp,
        },
      );
      throw new Error(
        `Timestamp out of reasonable range: ${value} (${timestamp})`,
      );
    }

    return timestamp;
  }

  // Handle null/undefined/other types
  throw new Error(
    `Cannot convert ${typeof value} to timestamp: ${String(value)}`,
  );
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
