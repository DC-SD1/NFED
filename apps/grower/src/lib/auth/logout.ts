import { toast } from "@cf/ui/components/sonner";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

import { revokeTokenOnServer } from "../api/token-revocation";
import { ApiError } from "../errors";
import { logger } from "../utils/logger";
import { getSignInUrl } from "../utils/navigation";

/**
 * Hook that provides a comprehensive logout function
 * @param locale - The current locale for redirection (defaults to 'en')
 * @returns Object containing the logout function and loading state
 */
export function useLogout(locale = "en") {
  const { signOut } = useAuth();
  const router = useRouter();

  /**
   * Comprehensive logout function that:
   * 1. Attempts to revoke the refresh token on the server
   * 2. Clears client-side tokens (handled by TokenProvider via Clerk signOut)
   * 3. Signs out from Clerk session
   * 4. Redirects to the sign-in page
   */
  const logout = async (refreshToken?: string): Promise<void> => {
    try {
      // Step 1: Attempt to revoke the refresh token on the server
      if (refreshToken) {
        try {
          await revokeTokenOnServer(refreshToken);
          logger.info("Token successfully revoked on server");
        } catch (error) {
          // Log the error but don't stop the logout process
          if (error instanceof ApiError) {
            logger.error("Server-side token revocation failed", {
              errorCode: error.errorCode,
              errorType: error.errorType,
              status: error.status,
              traceId: error.traceId,
              message: error.message,
            });

            // Don't show error to user for revocation failures to avoid confusion
            // The important part is that we proceed with client-side cleanup
          } else {
            logger.error("Unexpected error during token revocation", error);
          }
        }
      } else {
        logger.warn("No refresh token provided for server-side revocation");
      }

      // Step 2 & 3: Sign out from Clerk (this also clears client-side tokens via TokenProvider)
      await signOut();

      logger.info("Logout completed successfully");
    } catch (error) {
      // Even if something goes wrong, we should still try to clean up client-side
      logger.error("Error during logout process", error);

      try {
        // Fallback: still attempt Clerk signOut
        await signOut();
        const signInUrl = getSignInUrl(locale);
        router.replace(signInUrl);
      } catch (fallbackError) {
        logger.error("Fallback logout also failed", fallbackError);
        toast.error("Logout failed. Please refresh the page and try again.");
      }
    }
  };

  return { logout };
}

/**
 * Simple logout function for use outside of React components
 * Note: This is a simpler version that doesn't handle all edge cases
 * Prefer using the useLogout hook in React components
 */
export async function performLogout(
  signOut: () => Promise<void>,
  router: { replace: (url: string) => void },
  refreshToken?: string,
  locale = "en",
): Promise<void> {
  try {
    // Attempt server-side token revocation
    if (refreshToken) {
      try {
        await revokeTokenOnServer(refreshToken);
      } catch (error) {
        // Log but continue with client-side cleanup
        logger.error(
          "Server-side token revocation failed during logout",
          error,
        );
      }
    }

    // Clear Clerk session and tokens
    await signOut();

    // Redirect to sign-in
    const signInUrl = getSignInUrl(locale);
    router.replace(signInUrl);
  } catch (error) {
    logger.error("Error during performLogout", error);
    throw error;
  }
}
