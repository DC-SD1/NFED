import { useTranslations } from "next-intl";

import { extractErrorMessage, mapErrorToLocaleKey } from "./error-mapper";
import { logger } from "./logger";
import { showErrorToast } from "./toast";

/**
 * Custom hook for handling localized errors with toast notifications
 * Combines error mapping, localization, and toast display
 */
export function useLocalizedErrorHandler() {
  const t = useTranslations();

  /**
   * Handle an error by mapping it to a localized message and showing a toast
   * @param error - Error object from various sources (Clerk, openapi-fetch, generic)
   * @param fallbackMessage - Optional fallback message if localization fails
   */
  const handleError = (error: unknown, fallbackMessage?: string) => {
    // Map error to localization key
    const localizationKey = mapErrorToLocaleKey(error);

    try {
      // Try to get localized message
      const localizedMessage = t(localizationKey as any);

      // Check if translation was found (next-intl returns the key if translation is missing)
      if (localizedMessage !== localizationKey) {
        showErrorToast(localizedMessage);
        return;
      }
    } catch (translationError) {
      // Localization failed, fall through to fallback
      logger.warn("Failed to get localized error message:", {
        error: translationError,
      });
    }

    // Use provided fallback or extract message from error
    const fallback = fallbackMessage || extractErrorMessage(error);
    showErrorToast(fallback);
  };

  /**
   * Handle Clerk API errors specifically
   * @param error - Clerk API error
   * @param fallbackMessage - Optional fallback message
   */
  const handleClerkError = (error: unknown, fallbackMessage?: string) => {
    handleError(
      error,
      fallbackMessage || "Authentication error occurred. Please try again.",
    );
  };

  /**
   * Handle API errors from openapi-fetch specifically
   * @param error - API error with SharedKernelError structure
   * @param fallbackMessage - Optional fallback message
   */
  const handleApiError = (error: unknown, fallbackMessage?: string) => {
    handleError(
      error,
      fallbackMessage || "API request failed. Please try again.",
    );
  };

  return {
    handleError,
    handleClerkError,
    handleApiError,
  };
}

/**
 * Non-hook version for use in components that can't use hooks
 * Requires passing the translation function
 */
export const createLocalizedErrorHandler = (t: (key: string) => string) => {
  const handleError = (error: unknown, fallbackMessage?: string) => {
    const localizationKey = mapErrorToLocaleKey(error);

    try {
      const localizedMessage = t(localizationKey);

      if (localizedMessage !== localizationKey) {
        showErrorToast(localizedMessage);
        return;
      }
    } catch (translationError) {
      logger.warn("Failed to get localized error message:", {
        error: translationError,
      });
    }

    const fallback = fallbackMessage || extractErrorMessage(error);
    showErrorToast(fallback);
  };

  return {
    handleError,
    handleClerkError: (error: unknown, fallbackMessage?: string) =>
      handleError(
        error,
        fallbackMessage || "Authentication error occurred. Please try again.",
      ),
    handleApiError: (error: unknown, fallbackMessage?: string) =>
      handleError(
        error,
        fallbackMessage || "API request failed. Please try again.",
      ),
  };
};
