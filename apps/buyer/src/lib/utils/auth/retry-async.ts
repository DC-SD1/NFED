import { logger } from "@/lib/utils/logger";
import type { RetryConfig } from "@/types/auth-store.types";

export interface RetryOptions extends Partial<RetryConfig> {
  /**
   * Function to determine if error is retryable
   */
  shouldRetry?: (error: unknown, attempt: number) => boolean;

  /**
   * Operation name for logging
   */
  operationName?: string;

  /**
   * Additional context for logging
   */
  context?: Record<string, string | number | boolean>;
}

/**
 * Execute an async operation with configurable retry logic
 */
export async function retryAsync<T>(
  operation: () => Promise<T>,
  options?: RetryOptions,
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    backoffMultiplier = 2,
    shouldRetry = () => true,
    operationName = "Operation",
    context = {},
  } = options || {};

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await operation();

      if (attempt > 1) {
        logger.info(`${operationName} succeeded after retry`, {
          attempt,
          ...context,
        });
      }

      return result;
    } catch (error) {
      lastError = error;

      // Check if we should retry
      if (attempt < maxAttempts && shouldRetry(error, attempt)) {
        const delay = calculateDelay(attempt, initialDelay, backoffMultiplier);

        logger.warn(
          `${operationName} failed, retrying in ${delay}ms (attempt ${attempt}/${maxAttempts})`,
          {
            error: error instanceof Error ? error.message : "Unknown error",
            attempt,
            ...context,
          },
        );

        await sleep(delay);
      } else {
        // No more retries or error is not retryable
        break;
      }
    }
  }

  // All attempts failed
  logger.error(`${operationName} failed after all attempts`, {
    attempts: maxAttempts,
    error: lastError instanceof Error ? lastError.message : "Unknown error",
    ...context,
  });

  throw lastError;
}

/**
 * Calculate retry delay with exponential backoff
 */
function calculateDelay(
  attempt: number,
  initialDelay: number,
  backoffMultiplier: number,
): number {
  return initialDelay * Math.pow(backoffMultiplier, attempt - 1);
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Create a retryable version of an async function
 */
export function withRetry<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  options?: RetryOptions,
): (...args: TArgs) => Promise<TResult> {
  return async (...args: TArgs) => {
    return retryAsync(() => fn(...args), options);
  };
}
