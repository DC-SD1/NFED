"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { useAuthStoreContext } from "@/lib/stores/auth/auth-store-ssr";
import { authErrorHandler } from "@/lib/utils/auth/auth-error-handler";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toast";
import type { AuthError } from "@/types/auth-store.types";

/**
 * Hook to handle auth-related notifications
 * Separates UI concerns from the auth store
 */
export function useAuthNotifications() {
  const lastErrorRef = useRef<AuthError | null>(null);

  // Subscribe to auth state changes
  const { isOperationInProgress, isTokenExchangeHandled } = useAuthStoreContext(
    (state) => ({
      isOperationInProgress: state.isOperationInProgress,
      isTokenExchangeHandled: state.isTokenExchangeHandled,
    }),
  );

  // Monitor auth operations and show notifications
  useEffect(() => {
    // This is a simple implementation. In a real app, you might want to:
    // 1. Subscribe to specific auth events
    // 2. Use a more sophisticated event system
    // 3. Handle different types of notifications
  }, [isOperationInProgress, isTokenExchangeHandled]);

  /**
   * Show error notification based on auth error
   */
  const showAuthError = (error: AuthError) => {
    // Prevent duplicate notifications
    if (lastErrorRef.current?.code === error.code) {
      return;
    }

    lastErrorRef.current = error;
    const message = authErrorHandler.getUserMessage(error);
    showErrorToast(message);
  };

  /**
   * Show success notification
   */
  const showAuthSuccess = (message: string) => {
    showSuccessToast(message);
  };

  /**
   * Check if user should be logged out based on error
   */
  const shouldLogoutOnError = (error: AuthError): boolean => {
    return authErrorHandler.shouldLogout(error);
  };

  return {
    showAuthError,
    showAuthSuccess,
    shouldLogoutOnError,
  };
}

/**
 * Hook to handle auth errors with notifications
 * Use this in components that perform auth operations
 */
export function useAuthErrorHandler() {
  const { showAuthError, shouldLogoutOnError } = useAuthNotifications();
  const actions = useAuthStoreContext((state) => state.actions);
  const router = useRouter();

  /**
   * Handle auth operation errors with UI feedback
   */
  const handleAuthError = async (
    error: unknown,
    operationType: "refresh" | "exchange",
    signOutFn?: () => Promise<void>,
    locale?: string,
  ) => {
    // Process the error
    const authError = authErrorHandler.handle(error, operationType);

    // Show notification
    showAuthError(authError);

    // Check if logout is required
    if (shouldLogoutOnError(authError) && signOutFn) {
      await actions.logout(signOutFn, router, locale);
    }
  };

  return {
    handleAuthError,
  };
}
