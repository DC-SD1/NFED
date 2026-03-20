import type { RequestOptions } from "openapi-fetch";
import createFetchClient from "openapi-fetch";
import createClient from "openapi-react-query";

import type { paths } from "./generated/types";

/* ─────────────────────────────── Public API ────────────────────────────── */
export type AuthTokenProvider = () => Promise<string | null>;
export type TokenRefreshHandler = () => Promise<boolean>;
export type LogoutHandler = () => Promise<void>;
export type TokenExpirationChecker = () => boolean; // Check if token is expired or about to expire

export interface ApiClientOptions {
  authTokenProvider: AuthTokenProvider;
  baseUrl?: string;
  onTokenRefresh?: TokenRefreshHandler;
  onLogout?: LogoutHandler;
  tokenExpirationChecker?: TokenExpirationChecker; // New: proactive token check
}

/* ──────────────────────────────── Helpers ──────────────────────────────── */
interface ClientState {
  refreshPromise: Promise<boolean> | null;
}

const clientStates = new WeakMap<object, ClientState>();

function getClientState(client: object): ClientState {
  let state = clientStates.get(client);
  if (!state) {
    state = { refreshPromise: null };
    clientStates.set(client, state);
  }
  return state;
}

/* ─────────────────────────────── Factory ──────────────────────────────── */
export const createApiClient = ({
  authTokenProvider,
  baseUrl,
  onTokenRefresh,
  onLogout: _onLogout,
  tokenExpirationChecker,
}: ApiClientOptions) => {
  /* ---------------- Base client from `openapi-fetch` --------------------- */
  const fetchClient = createFetchClient<paths>({
    baseUrl:
      baseUrl ??
      process.env.NEXT_PUBLIC_API_BASE_URL ??
      "http://localhost:5039",
    headers: {},
  });

  /* ---------------- Typed interceptor builder (by method-name) ----------- */
  type FetchClient = typeof fetchClient;

  type ArgsOf<T> = T extends (...args: infer A) => unknown ? A : never;
  type ReturnOf<T> = T extends (...args: unknown[]) => infer R ? R : never;

  function createInterceptedMethod<
    K extends keyof FetchClient, // method name: GET, POST...
  >(methodName: K): FetchClient[K] {
    const original = fetchClient[methodName] as unknown as (
      this: FetchClient,
      ...args: ArgsOf<FetchClient[K]>
    ) => Promise<ReturnOf<FetchClient[K]>>;

    const intercepted = async function (
      this: FetchClient,
      ...args: ArgsOf<FetchClient[K]>
    ): Promise<ReturnOf<FetchClient[K]>> {
      /* 0 ▸ proactive token refresh check */
      if (
        tokenExpirationChecker &&
        tokenExpirationChecker() &&
        onTokenRefresh
      ) {
        const state = getClientState(fetchClient);

        // Prevent multiple concurrent refresh attempts
        if (!state.refreshPromise) {
          state.refreshPromise = onTokenRefresh().finally(() => {
            state.refreshPromise = null;
          });
        }

        try {
          const refreshSuccess = await state.refreshPromise;
          if (!refreshSuccess) {
            console.warn("Proactive token refresh failed");
          }
        } catch (error) {
          console.error("Proactive token refresh error:", error);
        }
      }

      /* 1 ▸ inject bearer token */
      const token = await authTokenProvider();
      const callArgs = [...args] as ArgsOf<FetchClient[K]>;

      if (token && callArgs[1]) {
        // Safely modify headers without changing the options structure
        if (typeof callArgs[1] === "object" && "headers" in callArgs[1]) {
          callArgs[1].headers = {
            ...callArgs[1].headers,
            Authorization: `Bearer ${token}`,
          };
        } else if (typeof callArgs[1] === "object") {
          callArgs[1] = {
            ...callArgs[1],
            headers: {
              Authorization: `Bearer ${token}`,
            },
          };
        }
      } else if (token && !callArgs[1]) {
        // If no options were provided, create minimal options with auth header
        // callArgs[1] = {
        //   headers: {
        //     Authorization: `Bearer ${token}`
        //   }
        // } as any;
        const authOptions: RequestOptions<unknown> = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        // Cast to the correct second-argument type for the intercepted method
        callArgs[1] = authOptions as ArgsOf<FetchClient[K]>[1];
      }

      /* 1.5 ▸ set Content-Type for requests with body */
      if (
        (methodName === "POST" ||
          methodName === "PUT" ||
          methodName === "PATCH") &&
        callArgs[1] &&
        typeof callArgs[1] === "object" &&
        "body" in callArgs[1]
      ) {
        // Check if body is FormData - if so, don't set Content-Type
        // The browser will set it automatically with the correct boundary
        const isFormData = callArgs[1].body instanceof FormData;

        if (!isFormData) {
          // Only set Content-Type for non-FormData requests
          if ("headers" in callArgs[1]) {
            const headers = callArgs[1].headers as Record<string, string>;
            if (!headers["Content-Type"]) {
              callArgs[1].headers = {
                ...headers,
                "Content-Type": "application/json",
              };
            }
          } else {
            // If no headers exist, add them
            callArgs[1] = {
              ...callArgs[1],
              headers: {
                "Content-Type": "application/json",
              },
            };
          }
        }
      }

      /* 2 ▸ perform request */
      const response = await original.apply(fetchClient, callArgs);

      /* 3 ▸ 401 → refresh-token logic - TEMPORARILY DISABLED */

      const status = (response as { response?: { status?: number } }).response
        ?.status;

      if (status === 401 && onTokenRefresh) {
        const url =
          (response as { response?: { url?: string } }).response?.url ?? "";

        const hittingRefreshEndpoint =
          url.includes("/refresh-token") ||
          url.includes("/users/refresh-token");

        if (hittingRefreshEndpoint) {
          if (_onLogout) await _onLogout();
          return response;
        }

        const state = getClientState(fetchClient);

        if (!state.refreshPromise) {
          state.refreshPromise = onTokenRefresh().finally(() => {
            state.refreshPromise = null;
          });
        }

        const refreshed = await state.refreshPromise;
        if (refreshed) {
          const newToken = await authTokenProvider();
          const callArgs = [...args] as ArgsOf<FetchClient[K]>;

          if (newToken && callArgs[1]) {
            // Safely modify headers without changing the options structure
            if (typeof callArgs[1] === "object" && "headers" in callArgs[1]) {
              callArgs[1].headers = {
                ...callArgs[1].headers,
                Authorization: `Bearer ${newToken}`,
              };
            } else if (typeof callArgs[1] === "object") {
              callArgs[1] = {
                ...callArgs[1],
                headers: {
                  Authorization: `Bearer ${newToken}`,
                },
              };
            }
          }
          return original.apply(fetchClient, callArgs);
        }

        if (_onLogout) await _onLogout();
      }

      return response;
    };

    return intercepted as unknown as FetchClient[K];
  }

  /* ---------------- Build the intercepted client ------------------------ */
  const interceptorClient: FetchClient = {
    ...fetchClient,
    GET: createInterceptedMethod("GET"),
    POST: createInterceptedMethod("POST"),
    PUT: createInterceptedMethod("PUT"),
    PATCH: createInterceptedMethod("PATCH"),
    DELETE: createInterceptedMethod("DELETE"),
  };

  /* ---------------- Expose fetch + React-Query helpers ------------------ */
  return {
    client: interceptorClient,
    ...createClient<paths>(interceptorClient),
  };
};

/* ────────────────────────── Public helper type ─────────────────────────── */
export type ApiClient = ReturnType<typeof createApiClient>;
