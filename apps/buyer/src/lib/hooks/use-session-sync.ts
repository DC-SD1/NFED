"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import {
  useAuthActions,
  useAuthStoreContext,
  useAuthUser,
} from "@/lib/stores/auth/auth-store-ssr";
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
  const isOnCountryPage = pathname?.includes("/country");
  const [hasRedirected, setHasRedirected] = useState(false);
  const lastSessionIdRef = useRef<string | null>(null);
  const hasExchangedRef = useRef(false);

  // Token exchange effect
  useEffect(() => {
    let isMounted = true;

    if (
      !isLoaded ||
      !isSignedIn ||
      !sessionId ||
      isRegistering ||
      isOnSsoCallback
    ) {
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
            logger.info("New OAuth user detected, delaying token exchange", {
              sessionId,
              timeSinceCreation,
              createdAt: user.createdAt,
            });

            // Wait 3 seconds to give SSO callback time to register the user
            await new Promise((resolve) => setTimeout(resolve, 3000));

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
          logger.info("Token exchange success", {
            sessionId,
            reason: result.reason,
          });
        } else {
          logger.warn("Token exchange failed", {
            sessionId,
            reason: result.reason,
          });
        }
      } catch (error) {
        if (!isMounted) return;
        logger.error("Token exchange error", { sessionId, error });
      }
    };

    void initiateTokenExchange();

    return () => {
      isMounted = false;
    };
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
    if (
      !isLoaded ||
      !isSignedIn ||
      !userId ||
      !roles?.length ||
      hasRedirected ||
      !pathname ||
      isOnSsoCallback ||
      isOnOnboarding ||
      isOnCountryPage
    ) {
      return;
    }

    setHasRedirected(true);

    if (shouldRedirectForRole(pathname, roles, locale)) {
      const destination = getRoleBasedDestination(roles, locale);
      logger.info("Role redirect", { sessionId, roles, pathname, destination });
      router.push(destination);
    }
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
    isOnCountryPage,
  ]);

  // Sign out effect
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      lastSessionIdRef.current = null;
      hasExchangedRef.current = false;
      setHasRedirected(false);
      logger.info("Session sync: User signed out, cleared session refs");
    }
  }, [isLoaded, isSignedIn]);

  return { hasRedirected };
}
