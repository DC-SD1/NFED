"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import {
  useAuthActions,
  useAuthStoreContext,
  useAuthUser,
} from "@/lib/stores/auth-store-ssr";
import { useSignUpStore } from "@/lib/stores/sign-up-store";
import { logger } from "@/lib/utils/logger";
import {
  getRoleBasedDestination,
  shouldRedirectForRole,
} from "@/lib/utils/navigation";

export function useSessionSync() {
  const { isLoaded, isSignedIn, getToken, sessionId } = useAuth();
  const { user } = useUser();
  const { exchangeTokens } = useAuthActions();
  const { roles, userId } = useAuthUser();
  const isTokenExchangeHandled = useAuthStoreContext(
    (state) => state.isTokenExchangeHandled,
  );
  const isRegistering = useSignUpStore((state) => state.isRegistering);
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const locale = typeof params?.locale === "string" ? params.locale : "en";
  const isOnSsoCallback = pathname?.includes("/sso-callback");
  const isOnSignIn = pathname?.includes("/sign-in");
  // TODo: Migrate to use backend response instead of pathname
  const signUpStore = useSignUpStore();
  const justCompletedSignup =
    pathname?.includes("/otp") &&
    signUpStore.otpVerified &&
    !signUpStore.isRegistering;
  const isOnOnboarding =
    pathname?.includes("/onboarding") || justCompletedSignup;
  const [hasRedirected, setHasRedirected] = useState(false);
  const lastSessionIdRef = useRef<string | null>(null);
  const hasExchangedRef = useRef(false);
  const retryCountRef = useRef(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Token exchange effect
  useEffect(() => {
    let isMounted = true;

    logger.info("Session sync: Token exchange effect triggered", {
      isLoaded,
      isSignedIn,
      sessionId,
      isRegistering,
      isOnSsoCallback,
      isTokenExchangeHandled,
      hasExchanged: hasExchangedRef.current,
      pathname,
    });

    if (
      !isLoaded ||
      !isSignedIn ||
      !sessionId ||
      isRegistering ||
      isOnSsoCallback
    ) {
      logger.info("Session sync: Skipping token exchange", {
        reason: !isLoaded
          ? "not loaded"
          : !isSignedIn
            ? "not signed in"
            : !sessionId
              ? "no session id"
              : isRegistering
                ? "is registering"
                : "on sso callback",
      });
      hasExchangedRef.current = false;
      return;
    }

    // Skip token exchange on sign-in page if auth store is empty but Clerk shows signed in
    // This indicates a recent logout where Clerk session hasn't fully cleared yet
    if (isOnSignIn && isSignedIn && !userId) {
      logger.info(
        "Session sync: Skipping token exchange on sign-in page after logout",
        {
          sessionId,
          isSignedIn,
          hasAuthStoreUser: !!userId,
        },
      );
      return;
    }

    if (isTokenExchangeHandled) {
      logger.info("Token exchange already handled", { sessionId });
      hasExchangedRef.current = true;
      lastSessionIdRef.current = sessionId;
      return;
    }

    if (sessionId === lastSessionIdRef.current && hasExchangedRef.current) {
      return;
    }

    const initiateTokenExchange = async () => {
      try {
        // Check if this is a new OAuth user (created within last 60 seconds)
        if (user?.createdAt) {
          const userCreatedAt = new Date(user.createdAt).getTime();
          const now = Date.now();
          const timeSinceCreation = now - userCreatedAt;

          // If user was created in the last 60 seconds, this is likely an OAuth sign-up
          if (timeSinceCreation < 60000) {
            // Wait 5 seconds to give SSO callback time to register the user
            await new Promise((resolve) => setTimeout(resolve, 5000));

            // Check if still mounted and exchange wasn't handled elsewhere
            if (!isMounted || isTokenExchangeHandled) {
              logger.info(
                "Token exchange cancelled - component unmounted or handled elsewhere",
              );
              return;
            }
          }
        }

        const clerkToken = await getToken();
        if (!clerkToken) {
          logger.error("Failed to get Clerk token");
          return;
        }

        const result = await exchangeTokens(clerkToken, sessionId);
        if (!isMounted) return;

        if (result.success) {
          lastSessionIdRef.current = sessionId;
          hasExchangedRef.current = true;
          retryCountRef.current = 0; // Reset retry count on success
        } else {
          // Don't mark as completed if it failed - allow retry
          hasExchangedRef.current = false;

          // Schedule retry for retryable errors (up to 3 attempts)
          if (
            retryCountRef.current < 3 &&
            result.reason !== "tokens_already_valid"
          ) {
            retryCountRef.current++;
            const retryDelay = Math.min(
              1000 * Math.pow(2, retryCountRef.current - 1),
              5000,
            ); // Exponential backoff: 1s, 2s, 4s

            // Clear any existing retry timeout
            if (retryTimeoutRef.current) {
              clearTimeout(retryTimeoutRef.current);
            }

            retryTimeoutRef.current = setTimeout(() => {
              if (isMounted && !hasExchangedRef.current) {
                void initiateTokenExchange();
              } else {
                //.ToDo
              }
            }, retryDelay);
          }
        }
      } catch (error) {
        if (!isMounted) return;
        logger.error("Token exchange error", { sessionId, error });
      }
    };

    void initiateTokenExchange();

    return () => {
      isMounted = false;
      // Clear retry timeout on cleanup
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isLoaded,
    isSignedIn,
    sessionId,
    isRegistering,
    isTokenExchangeHandled,
    isOnSsoCallback,
    isOnSignIn,
    userId,
    getToken,
    exchangeTokens,
    user,
  ]);

  // Role-based redirection effect
  useEffect(() => {
    logger.info("Session sync: Role-based redirection effect triggered", {
      isLoaded,
      isSignedIn,
      userId,
      roles,
      hasRedirected,
      pathname,
      isOnSsoCallback,
      isOnOnboarding,
      isTokenExchangeHandled,
    });

    if (
      !isLoaded ||
      !isSignedIn ||
      !userId ||
      !roles?.length ||
      hasRedirected ||
      !pathname ||
      isOnSsoCallback ||
      isOnOnboarding ||
      !isTokenExchangeHandled // Don't redirect until token exchange is complete
    ) {
      logger.info("Session sync: Skipping role-based redirect", {
        reason: !isLoaded
          ? "not loaded"
          : !isSignedIn
            ? "not signed in"
            : !userId
              ? "no user id"
              : !roles?.length
                ? "no roles"
                : hasRedirected
                  ? "already redirected"
                  : !pathname
                    ? "no pathname"
                    : isOnSsoCallback
                      ? "on sso callback"
                      : isOnOnboarding
                        ? "on onboarding"
                        : "token exchange not handled",
      });
      return;
    }

    // Add a small delay to ensure auth state is fully synchronized
    logger.info("Session sync: Setting up redirect timeout (300ms)");
    const redirectTimeout = setTimeout(() => {
      const shouldRedirect = shouldRedirectForRole(pathname, roles, locale);
      logger.info("Session sync: Redirect timeout executed", {
        shouldRedirect,
        pathname,
        roles,
        locale,
      });

      if (shouldRedirect) {
        const destination = getRoleBasedDestination(roles, locale);
        logger.info("Session sync: Performing role-based redirect", {
          sessionId,
          roles,
          pathname,
          destination,
        });
        setHasRedirected(true);
        router.push(destination);
      } else {
        logger.info("Session sync: No redirect needed for current path");
      }
    }, 300);

    return () => clearTimeout(redirectTimeout);
  }, [
    isLoaded,
    isSignedIn,
    userId,
    roles,
    hasRedirected,
    pathname,
    locale,
    router,
    sessionId,
    isOnSsoCallback,
    isOnOnboarding,
    isTokenExchangeHandled,
  ]);

  // Sign out effect
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      lastSessionIdRef.current = null;
      hasExchangedRef.current = false;
      retryCountRef.current = 0;
      setHasRedirected(false);

      // Clear any pending retry timeout
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }

      logger.info("Session sync: User signed out, cleared session refs");
    }
  }, [isLoaded, isSignedIn]);

  return { hasRedirected };
}
