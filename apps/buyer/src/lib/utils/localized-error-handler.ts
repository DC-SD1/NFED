import { useTranslations } from "next-intl";

import { extractErrorMessage, mapErrorToLocaleKey } from "./error-mapper";
import { logger } from "./logger";
import { showErrorToast } from "./toast";

/**
 * Custom hook for handling localized errors with toast notifications
 * Combines error mapping, localization, and toast display
 */
export function useLocalizedErrorHandler(
  translationNamespace?: "common" | "auth" | "api",
) {
  const t = useTranslations(translationNamespace || "common");

  /**
   * Handle an error by mapping it to a localized message and showing a toast
   * @param error - Error object from various sources (Clerk, openapi-fetch, generic)
   * @param fallbackMessage - Optional fallback message if localization fails
   */
  const handleError = (error: unknown, fallbackMessage?: string) => {
    // First, try to extract a direct error message from the error object
    const extractedMessage = extractErrorMessage(error);

    // Map error to localization key
    const localizationKey = mapErrorToLocaleKey(error);
    console.log("localizationKey: ", localizationKey);

    try {
      // Try to get localized message
      const localizedMessage = t(localizationKey as any);
      console.log("localizedMessage: ", localizedMessage);

      // Check if translation was found (next-intl returns the key if translation is missing)
      if (
        localizedMessage &&
        localizedMessage !== localizationKey &&
        !localizedMessage.includes(".")
      ) {
        logger.info("Found localized error message", {
          key: localizationKey,
          message: localizedMessage,
          namespace: translationNamespace,
        });
        showErrorToast(localizedMessage);
        return;
      } else {
        logger.warn(
          "Translation not found or invalid, falling back to extracted message",
          {
            key: localizationKey,
            translated: localizedMessage,
            namespace: translationNamespace,
          },
        );
      }
    } catch (translationError) {
      // Localization failed, log the error
      logger.warn("Failed to get localized error message:", {
        error: translationError,
        key: localizationKey,
        namespace: translationNamespace,
        originalError: error,
      });
    }

    // If we have a meaningful extracted message, use it
    if (
      extractedMessage &&
      extractedMessage !== "An unknown error occurred" &&
      !extractedMessage.includes(".")
    ) {
      logger.info("Using extracted error message", { extractedMessage });
      showErrorToast(extractedMessage);
      return;
    }

    // Use provided fallback or a generic message
    const fallback = fallbackMessage || "An error occurred. Please try again.";
    logger.info("Using fallback error message", { fallback });
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
    // First, try to extract a direct error message from the error object
    const extractedMessage = extractErrorMessage(error);

    const localizationKey = mapErrorToLocaleKey(error);

    try {
      const localizedMessage = t(localizationKey);

      if (
        localizedMessage &&
        localizedMessage !== localizationKey &&
        !localizedMessage.includes(".")
      ) {
        showErrorToast(localizedMessage);
        return;
      }
    } catch (translationError) {
      logger.warn("Failed to get localized error message:", {
        error: translationError,
        localizationKey,
        originalError: error,
      });
    }

    // If we have a meaningful extracted message, use it
    if (
      extractedMessage &&
      extractedMessage !== "An unknown error occurred" &&
      !extractedMessage.includes(".")
    ) {
      showErrorToast(extractedMessage);
      return;
    }

    const fallback = fallbackMessage || "An error occurred. Please try again.";
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
