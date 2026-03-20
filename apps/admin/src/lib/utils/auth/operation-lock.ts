import { logger } from "@/lib/utils/logger";
import type { AuthState } from "@/types/auth-store.types";

export interface OperationLockState {
  isOperationInProgress: boolean;
}

/**
 * Higher-order function to wrap async operations with a lock
 * Prevents concurrent operations from running
 */
export function withOperationLock<T>(
  operation: () => Promise<T>,
  getState: () => OperationLockState,
  setState: (state: Pick<OperationLockState, "isOperationInProgress">) => void,
  operationName?: string,
): Promise<T | null> {
  // Check if an operation is already in progress
  if (getState().isOperationInProgress) {
    logger.info(
      `${operationName || "Operation"} already in progress, skipping`,
    );
    return Promise.resolve(null);
  }

  // Set the lock
  setState({ isOperationInProgress: true });

  // Execute the operation and ensure lock is released
  return operation()
    .then((result) => {
      setState({ isOperationInProgress: false });
      return result;
    })
    .catch((error) => {
      setState({ isOperationInProgress: false });
      throw error;
    });
}

/**
 * Create a locked version of an async function
 * Useful for creating multiple locked operations with shared state
 */
export function createLockedOperation<TArgs extends unknown[], TResult>(
  operation: (...args: TArgs) => Promise<TResult>,
  getState: () => OperationLockState,
  setState: (state: Pick<OperationLockState, "isOperationInProgress">) => void,
  operationName?: string,
): (...args: TArgs) => Promise<TResult | null> {
  return async (...args: TArgs) => {
    return withOperationLock(
      () => operation(...args),
      getState,
      setState,
      operationName,
    );
  };
}

/**
 * Check if tokens are still valid
 */
export function areTokensValid(
  state: Pick<AuthState, "accessToken" | "expiresAt">,
): boolean {
  return !!(
    state.accessToken &&
    state.expiresAt &&
    state.expiresAt > Date.now() / 1000
  );
}
