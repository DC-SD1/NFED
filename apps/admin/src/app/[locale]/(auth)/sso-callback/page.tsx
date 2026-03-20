"use client";

import {
  AuthenticateWithRedirectCallback,
  useAuth,
  useClerk,
} from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";

import { ROLE_ROUTING_CONFIG } from "@/lib/config/auth";
import { useClerkSignOut } from "@/lib/hooks/use-clerk-signout";
import { determinePrimaryRole, ROLES } from "@/lib/schemas/auth";
import { useAuthActions } from "@/lib/stores/auth/auth-store-ssr";
import { fetchWithCsrf } from "@/lib/utils/csrf-client";
import { useLocalizedErrorHandler } from "@/lib/utils/localized-error-handler";
import { logger } from "@/lib/utils/logger";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toast";

export default function SsoCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const clerk = useClerk();
  const { handleError } = useLocalizedErrorHandler();
  const t = useTranslations("auth");
  const authActions = useAuthActions();
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasProcessed, setHasProcessed] = useState(false);
  const { signOutUser } = useClerkSignOut();

  // Get redirect URL from query params if provided
  const redirectUrl =
    searchParams.get("redirect_url") || searchParams.get("redirectUrl");

  // This prevents useSessionSync from attempting automatic exchange
  useEffect(() => {
    authActions.setTokenExchangeHandled(true);
    logger.info(
      "SSO callback: Marked token exchange as handled to prevent race condition",
    );

    // Reset flag on unmount only if OAuth flow wasn't completed successfully
    return () => {
      if (!hasProcessed) {
        authActions.setTokenExchangeHandled(false);
        logger.info(
          "SSO callback: Resetting token exchange flag on unmount (flow not completed)",
        );
      }
    };
  }, [authActions, hasProcessed]);

  // Handle OAuth account transfer scenarios
  const handleOAuthTransfer = useCallback(async () => {
    if (!clerk) return false;

    const { signIn, signUp } = clerk.client;

    try {
      // Check if user exists but needs to sign in (attempted sign up with existing account)
      const userExistsButNeedsToSignIn =
        signUp?.verifications?.externalAccount?.status === "transferable" &&
        signUp?.verifications?.externalAccount?.error?.code ===
          "external_account_exists";

      if (userExistsButNeedsToSignIn) {
        const res = await signIn.create({ transfer: true });
        if (res.status === "complete" && res.createdSessionId) {
          await clerk.setActive({ session: res.createdSessionId });
          return true;
        }
      }

      // Check if user needs to be created (attempted sign in with non-existent account)
      const userNeedsToBeCreated =
        signIn?.firstFactorVerification?.status === "transferable";

      if (userNeedsToBeCreated) {
        logger.info("SSO callback: Transferring from signIn to signUp");
        const res = await signUp.create({ transfer: true });
        if (res.status === "complete" && res.createdSessionId) {
          await clerk.setActive({ session: res.createdSessionId });
          logger.info("SSO callback: Transfer to signUp successful");
          return true;
        }
      }

      // No transfer needed
      return false;
    } catch (error) {
      logger.error("SSO callback: Transfer failed", error);
      throw error;
    }
  }, [clerk]);

  // Backend sync function - isolated from OAuth flow
  const syncWithBackend = useCallback(
    async (user?: typeof clerk.user) => {
      const currentUser = user || clerk.user;
      if (!currentUser || !getToken) {
        throw new Error("User or getToken not available");
      }

      // Get Clerk token
      const clerkToken = await getToken();
      if (!clerkToken) {
        throw new Error("Failed to get Clerk token");
      }

      // Call our SSO callback endpoint with CSRF protection
      const response = await fetchWithCsrf("/api/auth/sso-callback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clerkToken,
          isNewUser: false, // Deprecated - backend handles this now
          userData: {
            email: currentUser.primaryEmailAddress?.emailAddress || "",
            firstName: currentUser.firstName || "",
            lastName: currentUser.lastName || "",
            authId: currentUser.id,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        const err = new Error(error?.message || "SSO callback failed");
        err.name = error?.errorCode;
        err.message = error?.message;
        throw err;
      }

      const data = await response.json();

      // Store user data in auth store
      authActions.setUserData({
        userId: data.userId,
        email: data.email,
        roles: data.roles,
        expiresAt: data.expiresAt,
        fullName: `${currentUser.firstName} ${currentUser.lastName}`,
      });

      try {
        showSuccessToast(
          data.isNewUser
            ? t("accountCreated")
            : t("welcomeBack", { name: currentUser.firstName || "" }),
        );
      } catch (translationError) {
        logger.warn("Translation failed, using fallback", { translationError });
        showSuccessToast(
          data.isNewUser
            ? "Account created successfully!"
            : `Welcome back, ${currentUser.firstName || ""}!`,
        );
      }

      return data;
    },
    [clerk, getToken, authActions, t],
  );

  // Main OAuth callback handler
  const handleOAuthCallback = useCallback(async () => {
    if (isProcessing || hasProcessed) return;

    try {
      setIsProcessing(true);

      // Wait for Clerk to be loaded
      if (!isLoaded || !clerk) return;

      // Try to handle OAuth transfer scenarios first
      let transferHandled = false;
      try {
        transferHandled = await handleOAuthTransfer();
        if (transferHandled) {
          // Wait for Clerk's state to update after transfer
          // This is crucial for new sign-ups where the session needs to be established
          let retries = 0;
          const maxRetries = 20; // Increased for Microsoft SSO
          const retryDelay = 1500; // Increased delay

          while (retries < maxRetries) {
            // Re-check clerk's current state
            if (clerk.user && clerk.session) {
              logger.info("SSO callback: Session established after transfer", {
                userId: clerk.user.id,
                sessionId: clerk.session.id,
                retriesNeeded: retries,
                provider: "Microsoft", // Update provider logging
              });
              break;
            }

            await new Promise((resolve) => setTimeout(resolve, retryDelay));
            retries++;

            if (retries === maxRetries) {
              logger.warn(
                "SSO callback: Session not established after maximum retries",
                {
                  maxRetries,
                  totalWaitTime: maxRetries * retryDelay,
                },
              );
            }
          }
        }
      } catch (transferError) {
        logger.warn(
          "SSO callback: Transfer attempt failed, continuing with normal flow",
          { error: transferError },
        );
      }

      // For transfer scenarios, check clerk.user directly as isSignedIn might not be updated yet
      const effectiveUser = transferHandled
        ? clerk.user
        : isSignedIn
          ? clerk.user
          : null;

      if (!effectiveUser) {
        logger.error("SSO callback: User not available after OAuth flow", {
          transferHandled,
          isSignedIn,
          hasClerkUser: !!clerk.user,
          hasClerkSession: !!clerk.session,
        });
        handleError(
          new Error("SSO_NOT_SIGNED_IN"),
          t("errors.oauthFailed", { provider: "Microsoft" }),
        );
        router.replace("/");
        return;
      }

      // Sync with backend - pass the effective user for transfer scenarios
      const data = await syncWithBackend(effectiveUser);

      // Mark as processed to prevent duplicate calls
      setHasProcessed(true);

      // Redirect based on user status
      const userRoles = data.roles || [ROLES.ADMIN];
      const primaryRole = determinePrimaryRole(userRoles);
      let redirectPath =
        ROLE_ROUTING_CONFIG[primaryRole]?.dashboard || "/dashboard";

      if (redirectUrl?.startsWith("/")) {
        redirectPath = redirectUrl;
      }
      router.replace(redirectPath);
    } catch (error: any) {
      logger.error("SSO callback error:", error);
      authActions.setTokenExchangeHandled(false);
      await signOutUser();
      if (error?.name === "VALIDATION_ERROR") {
        showErrorToast(
          error?.message ?? "Error occurred while processing signing up.",
        );
      } else {
        handleError(error, t("errors.oauthFailed", { provider: "Microsoft" }));
      }
      router.replace("/");
    } finally {
      setIsProcessing(false);
    }
  }, [
    isLoaded,
    isSignedIn,
    clerk,
    isProcessing,
    hasProcessed,
    handleOAuthTransfer,
    syncWithBackend,
    router,
    handleError,
    t,
    authActions,
    redirectUrl,
    signOutUser,
  ]);

  // Effect to handle OAuth callback when conditions are met
  useEffect(() => {
    if (isLoaded && !isProcessing && !hasProcessed) {
      void handleOAuthCallback();
    }
  }, [isLoaded, handleOAuthCallback, isProcessing, hasProcessed]);

  // If Clerk is not loaded yet, show the redirect callback component
  if (!isLoaded) {
    return (
      <AuthenticateWithRedirectCallback
        signInFallbackRedirectUrl="#"
        signUpFallbackRedirectUrl="#"
      />
    );
  }

  // Show processing state
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="text-primary mx-auto mb-4 size-12 animate-spin">
          <div className="border-t-primary size-full rounded-full border-4 border-gray-300"></div>
        </div>
        <p className="text-lg">{t("processing")}...</p>
      </div>
    </div>
  );
}
