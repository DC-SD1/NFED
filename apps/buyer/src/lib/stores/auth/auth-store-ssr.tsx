/* eslint-disable @typescript-eslint/no-empty-function */
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
import { getSignInUrlWithQuery } from "@/lib/utils/navigation";
import type { AuthState, AuthStoreState } from "@/types/auth-store.types";

// Create SSR-safe storage adapter
const createNoopStorage = () => {
  return {
    getItem: () => null,
    setItem: () => { },
    removeItem: () => { },
  };
};

// Factory function to create auth store with cleaner separation of concerns
export const createAuthStore = (initState?: Partial<AuthState>) => {
  return createStore<AuthStoreState>()(
    persist(
      (set, get) => ({
        // Initial State with optional overrides
        accessToken: null,
        refreshToken: null,
        expiresAt: null,
        userId: null,
        email: null,
        roles: null,
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
            options?: { reason?: string },
          ) => {
            // Always clear local state first
            get().actions.clearStore();

            // Best effort API logout
            await authApiService.logout();

            // Clerk sign out (best effort)
            try {
              await signOutFn();
              logger.info("Clerk signOut successful");

              // Add a small delay to ensure Clerk has time to clear OAuth session
              await new Promise((resolve) => setTimeout(resolve, 100));
            } catch (clerkError) {
              logger.error("Clerk signOut failed", clerkError);
            }

            // Redirect to sign-in using router.replace
            try {
              const target =
                options?.reason
                  ? getSignInUrlWithQuery(locale, { reason: options.reason })
                  : getSignInUrl(locale);
              router.replace(target);
            } catch (redirectError) {
              logger.error("Redirect failed", redirectError);
              // Note: UI layer should handle this error notification
            }
          },

          clearStore: () => {
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
            logger.info("Auth store cleared");
          },

          setTokens: (tokens: Partial<AuthState>) => {
            set(tokens);
          },

          setUserData: (data: {
            userId: string;
            email: string;
            roles: string[];
            expiresAt: number;
          }) => {
            set({
              userId: data.userId,
              email: data.email,
              roles: data.roles,
              expiresAt: data.expiresAt,
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

            // Clear store as tokens are invalid
            get().actions.clearStore();

            // Log the normalized error
            logger.error(`Token ${operationType} error processed`, {
              code: authError.code,
              message: authError.message,
              shouldLogout: authErrorHandler.shouldLogout(authError),
            });
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
