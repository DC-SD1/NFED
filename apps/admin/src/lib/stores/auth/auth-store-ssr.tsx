"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createJSONStorage, persist } from "zustand/middleware";
import { useStoreWithEqualityFn } from "zustand/traditional";
import { createStore } from "zustand/vanilla";

import { cookieStorage } from "@/lib/client/zustand-cookie-storage";
import { authApiService } from "@/lib/services/auth/auth-api.service";
import { tokenExchangeService } from "@/lib/services/auth/token-exchange.service";
import { tokenRefreshService } from "@/lib/services/auth/token-refresh.service";
import { AUTH_CONFIG } from "@/lib/stores/auth/auth-store.config";
import { authErrorHandler } from "@/lib/utils/auth/auth-error-handler";
import {
  areTokensValid,
  withOperationLock,
} from "@/lib/utils/auth/operation-lock";
import { logger } from "@/lib/utils/logger";
import { getSignInUrl } from "@/lib/utils/navigation";
import type { AuthState, AuthStoreState } from "@/types/auth-store.types";

// Create SSR-safe storage adapter
const createNoopStorage = () => {
  return {
    getItem: () => null,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    setItem: () => {},
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    removeItem: () => {},
  };
};

// Factory function to create auth store with cleaner separation of concerns
export const createAuthStore = (initState?: Partial<AuthState>) => {
  return createStore<AuthStoreState>()(
    persist(
      (set, get) => ({
        // Initial State with optional overrides
        // NOTE: accessToken and refreshToken are stored in HTTP-only cookies for security
        // They will always be null in client state. Use userId/email/expiresAt to check auth status
        accessToken: null,
        refreshToken: null,
        expiresAt: null,
        userId: null,
        email: null,
        roles: null,
        fullName: null,
        status: null,
        isOperationInProgress: false,
        isTokenExchangeHandled: false,
        ...initState,
        // Actions - now much cleaner and focused
        actions: {
          exchangeTokens: async (clerkToken: string, sessionId?: string) => {
            // Check if we already have valid tokens
            if (areTokensValid(get())) {
              logger.info(
                "Valid tokens already available, skipping token exchange",
              );
              return { success: true, reason: "tokens_already_valid" };
            }
            // Use operation lock to prevent concurrent exchanges
            const result = await withOperationLock(
              async () => {
                const exchangeResult = await tokenExchangeService.exchange(
                  clerkToken,
                  sessionId,
                );
                if (exchangeResult.success && exchangeResult.data) {
                  // Update store with exchange results
                  set({
                    expiresAt: exchangeResult.data.expiresAt,
                    userId: exchangeResult.data.userId,
                    email: exchangeResult.data.email,
                    roles: exchangeResult.data.roles,
                    isTokenExchangeHandled: true,
                  });
                } else if (exchangeResult.error) {
                  // Handle error based on type
                  await get().actions.handleTokenOperationError(
                    exchangeResult.error,
                    "exchange",
                  );
                }
                return exchangeResult;
              },
              get,
              set,
              "Token exchange",
            );
            return (
              result || { success: false, reason: "operation_in_progress" }
            );
          },

          refreshTokens: async () => {
            // Use operation lock to prevent concurrent refreshes
            const result = await withOperationLock(
              async () => {
                const refreshResult = await tokenRefreshService.refresh(
                  get().expiresAt,
                );

                if (refreshResult.success && refreshResult.data) {
                  // Update expiration
                  set({
                    expiresAt: refreshResult.data.expiresAt,
                  });
                } else if (refreshResult.error) {
                  // Handle error
                  await get().actions.handleTokenOperationError(
                    refreshResult.error,
                    "refresh",
                  );
                }

                return refreshResult;
              },
              get,
              set,
              "Token refresh",
            );

            return (
              result || { success: false, reason: "operation_in_progress" }
            );
          },

          logout: async (
            signOutFn: () => Promise<void>,
            router: { replace: (url: string) => void },
            locale = "en",
          ) => {
            // Always clear local state first (this now also removes cookies)
            get().actions.clearStore();

            // Clear all cookies immediately
            try {
              // Best effort to clear cookies via API call
              await authApiService.logout();
            } catch (error) {
              logger.warn(
                "API logout failed, continuing with client-side cleanup",
                {
                  error: error instanceof Error ? error.message : String(error),
                },
              );
            }

            // Clerk sign out (best effort)
            try {
              await signOutFn();
              logger.info("Clerk signOut successful");

              // Add delay to ensure Clerk has time to clear OAuth session
              await new Promise((resolve) => setTimeout(resolve, 200));
            } catch (clerkError) {
              logger.error("Clerk signOut failed", clerkError);
            }

            // Force clear localStorage and sessionStorage
            if (typeof window !== "undefined") {
              try {
                localStorage.clear();
                sessionStorage.clear();
              } catch (storageError) {
                logger.warn("Failed to clear browser storage", {
                  error:
                    storageError instanceof Error
                      ? storageError.message
                      : String(storageError),
                });
              }
            }

            // Redirect to sign-in using router.replace
            try {
              router.replace(getSignInUrl(locale));
            } catch (redirectError) {
              logger.error("Redirect failed", redirectError);
              // Force reload as fallback
              if (typeof window !== "undefined") {
                window.location.href = getSignInUrl(locale);
              }
            }
          },

          clearStore: () => {
            // DEBUG: Log state before clearing
            const _currentState = get();

            set({
              accessToken: null,
              refreshToken: null,
              expiresAt: null,
              userId: null,
              email: null,
              roles: null,
              isOperationInProgress: false,
              isTokenExchangeHandled: false,
            });

            // Explicitly remove the persisted cookie to prevent stale data
            if (typeof window !== "undefined") {
              // Remove the main auth-storage cookie
              document.cookie = `${AUTH_CONFIG.storage.name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;

              // Also remove any domain-specific variations
              document.cookie = `${AUTH_CONFIG.storage.name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
              document.cookie = `${AUTH_CONFIG.storage.name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname}`;

              // Remove any other auth-related cookies that might exist
              const authCookiePrefixes = ["cf-user-", "auth-", "clerk-"];
              document.cookie.split(";").forEach((cookie) => {
                const eqPos = cookie.indexOf("=");
                const name =
                  eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();

                // Remove cookies with auth-related prefixes
                if (
                  authCookiePrefixes.some((prefix) => name.startsWith(prefix))
                ) {
                  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
                  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
                  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname}`;
                }
              });
            }
          },

          setTokens: (tokens: Partial<AuthState>) => {
            set(tokens);
          },

          setUserData: (data: {
            userId: string;
            email: string;
            roles: string[];
            expiresAt: number;
            fullName: string;
          }) => {
            set({
              userId: data.userId,
              email: data.email,
              roles: data.roles,
              expiresAt: data.expiresAt,
              fullName: data.fullName,
              isOperationInProgress: false,
              isTokenExchangeHandled: true,
            });
          },

          setTokenExchangeHandled: (handled: boolean) => {
            set({ isTokenExchangeHandled: handled });
          },

          handleTokenOperationError: async (
            error: unknown,
            operationType: "refresh" | "exchange",
          ) => {
            // Use error handler to process the error
            const authError = authErrorHandler.handle(error, operationType);

            // Only clear store for permanent failures (401, invalid refresh token)
            // Keep existing auth state for retryable errors (network, server errors)
            const shouldClearStore = authErrorHandler.shouldLogout(authError);

            if (shouldClearStore) {
              // Permanent failure - clear the store
              get().actions.clearStore();

              // Attempt to sign out from Clerk
              if (typeof window !== "undefined" && window.Clerk) {
                logger.info(
                  "Attempting to sign out from Clerk due to 401 error",
                );
                try {
                  // Use Clerk's client-side API directly
                  window.Clerk.signOut()
                    .then(() => {
                      logger.info(
                        "Successfully signed out from Clerk after 401",
                      );
                    })
                    .catch((error) => {
                      logger.error(
                        "Failed to sign out from Clerk after 401",
                        error,
                      );
                    });
                } catch (error) {
                  logger.error("Error accessing Clerk for signout", error);
                }
              }

              // Redirect to sign-in page after clearing store for permanent failures
              if (typeof window !== "undefined") {
                // Try to get locale from URL or default to 'en'
                const locale = window.location.pathname.split("/")[1] || "en";
                window.location.href = getSignInUrl(locale);
              }
            } else {
              // Retryable error - keep existing auth state
            }

            // Note: UI layer should handle error notifications and logout if needed
          },
        },
      }),
      {
        name: AUTH_CONFIG.storage.name,
        storage: createJSONStorage(() =>
          typeof window !== "undefined" ? cookieStorage : createNoopStorage(),
        ),
        skipHydration: true, // Critical for SSR

        // Only persist non-sensitive user metadata
        partialize: (state) => {
          const persistFields: Partial<AuthState> = {};
          AUTH_CONFIG.storage.persistFields.forEach((field) => {
            (persistFields as any)[field] = state[field];
          });
          return persistFields;
        },
      },
    ),
  );
};

// Types
export type AuthStore = ReturnType<typeof createAuthStore>;
export type AuthStoreApi = ReturnType<typeof createAuthStore>;

// Create context
export const AuthStoreContext = createContext<AuthStoreApi | undefined>(
  undefined,
);

// Provider component
export interface AuthStoreProviderProps {
  children: ReactNode;
  initialState?: Partial<AuthState>;
}

export const AuthStoreProvider = ({
  children,
  initialState,
}: AuthStoreProviderProps) => {
  const storeRef = useRef<AuthStoreApi>();

  if (!storeRef.current) {
    storeRef.current = createAuthStore(initialState);
  }

  useEffect(() => {
    // Manually trigger rehydration after mount to avoid SSR issues
    const store = storeRef.current;
    if (store && "persist" in store) {
      (store as any).persist.rehydrate();
    }
  }, []);

  return (
    <AuthStoreContext.Provider value={storeRef.current}>
      {children}
    </AuthStoreContext.Provider>
  );
};

// Custom hook to use the auth store
export const useAuthStoreContext = <T,>(
  selector: (store: AuthStoreState) => T,
  equalityFn?: (left: T, right: T) => boolean,
): T => {
  const store = useContext(AuthStoreContext);
  if (!store) {
    throw new Error(
      "useAuthStoreContext must be used within AuthStoreProvider",
    );
  }

  return useStoreWithEqualityFn(store, selector, equalityFn);
};

// Helper hooks for easier access
export const useAuthActions = () =>
  useAuthStoreContext((state) => state.actions);

export const useAuthUser = () =>
  useAuthStoreContext((state) => ({
    userId: state.userId,
    email: state.email,
    roles: state.roles,
    fullName: state.fullName,
  }));

export const useAuthTokens = () =>
  useAuthStoreContext((state) => ({
    accessToken: state.accessToken,
    refreshToken: state.refreshToken,
    expiresAt: state.expiresAt,
  }));

export const useIsAuthenticated = () =>
  useAuthStoreContext((state) => !!(state.accessToken && state.userId));

// Hook to track hydration state
export const useHydrated = () => {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return hydrated;
};
