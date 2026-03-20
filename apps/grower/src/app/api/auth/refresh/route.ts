import { NextResponse } from "next/server";

import { refreshAccessToken } from "@/lib/api/token-refresh";
import { ApiError } from "@/lib/errors";
import { 
  AUTH_COOKIE_NAMES,
  getRefreshToken,
  setAuthCookies,
  updateAccessTokenCookie} from "@/lib/server/cookies";
import { logger } from "@/lib/utils/logger";
import { 
  type AuthSession,
  TokenRefreshResponseSchema,
  type UserMetadata} from "@/types/auth";

/**
 * POST /api/auth/refresh
 * 
 * Refresh expired access tokens using the refresh token from cookies.
 * Updates authentication cookies with new tokens and expiration.
 */
export async function POST(request: Request) {
  try {
    // Get refresh token from HTTP-only cookie
    const refreshToken = await getRefreshToken();
    
    if (!refreshToken) {
      logger.warn("Refresh token missing from cookies");
      return NextResponse.json(
        { message: "Refresh token not found" },
        { status: 401 }
      );
    }

    try {
      // Call backend refresh endpoint using existing utility
      const refreshResult = await refreshAccessToken(refreshToken);
      
      // Log the raw response for debugging timestamp issues
      logger.info("Backend refresh response received", {
        rawData: refreshResult,
        expiresAt: refreshResult?.expiresAt,
        expiresAtType: typeof refreshResult?.expiresAt,
        expiresAtValue: refreshResult?.expiresAt,
        expiresAtLength: typeof refreshResult?.expiresAt === 'string' ? refreshResult.expiresAt.length : 
                         typeof refreshResult?.expiresAt === 'number' ? refreshResult.expiresAt.toString().length : 0,
      });
      
      // Validate response structure
      const validationResult = TokenRefreshResponseSchema.safeParse(refreshResult);
      
      if (!validationResult.success) {
        logger.error("Invalid refresh response format", {
          errors: validationResult.error.flatten(),
          data: refreshResult,
          zodErrors: validationResult.error.issues,
        });
        return NextResponse.json(
          { message: "Invalid server response" },
          { status: 500 }
        );
      }

      const { accessToken, refreshToken: newRefreshToken, expiresAt } = validationResult.data;
      
      // Log token expiration times for debugging
      logger.info("Token expiration times", {
        accessTokenExpiresAt: new Date(expiresAt).toISOString(),
        accessTokenExpiresInMs: expiresAt - Date.now(),
        refreshTokenWillExpireAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });
      
      // If refresh token rotation is enabled (new refresh token provided)
      if (newRefreshToken) {
        // First try to get user metadata using the proper cookie functions
        const { getUserMetadata } = await import("@/lib/server/cookies");
        const existingUserMetadata = await getUserMetadata();
        
        let userId = "";
        let email = "";
        let roles: string[] = [];
        
        if (existingUserMetadata) {
          // Use existing user metadata if available
          userId = existingUserMetadata.userId;
          email = existingUserMetadata.email;
          roles = existingUserMetadata.roles || [];
          
          logger.info("Using existing user metadata for token rotation", {
            userId,
            email,
            hasRoles: roles.length > 0,
          });
        } else {
          // Fallback to parsing from raw cookies if getUserMetadata fails
          const currentCookies = request.headers.get("cookie");
          
          if (currentCookies) {
            const cookiePairs = currentCookies.split(";").map(c => c.trim());
            for (const pair of cookiePairs) {
              const [name, value] = pair.split("=");
              if ((name === AUTH_COOKIE_NAMES.USER_METADATA || name === `__Secure-${AUTH_COOKIE_NAMES.USER_METADATA}`) && value) {
                try {
                  const metadata = JSON.parse(decodeURIComponent(value));
                  userId = metadata.userId || "";
                  email = metadata.email || "";
                  roles = metadata.roles || [];
                  
                  logger.info("Parsed user metadata from raw cookies", {
                    userId,
                    email,
                    hasRoles: roles.length > 0,
                  });
                } catch (e) {
                  logger.warn("Failed to parse user metadata from cookies", {
                    error: e instanceof Error ? e.message : String(e),
                  });
                }
              }
            }
          }
        }
        
        // Validate that we have required user data
        if (!userId || !email) {
          logger.error("Missing required user data for session creation", {
            hasUserId: !!userId,
            hasEmail: !!email,
            hasRoles: roles.length > 0,
          });
          
          return NextResponse.json(
            { message: "Unable to refresh token: missing user information" },
            { status: 500 }
          );
        }
        
        // Create new session with rotated tokens
        const newSession: AuthSession = {
          accessToken,
          refreshToken: newRefreshToken,
          userId,
          email,
          roles,
          expiresAt, // Access token expiration (already converted by parseApiDateTime in schema)
        };
        
        // Update all auth cookies
        await setAuthCookies(newSession);
        
        // Verify cookies were actually set
        const { hasAuthCookies } = await import("@/lib/server/cookie-verification");
        const cookiesSet = await hasAuthCookies();
        
        if (!cookiesSet) {
          logger.error("Failed to verify cookies after refresh with rotation", {
            userId,
          });
        }
        
        logger.info("Token refresh successful with rotation", {
          userId,
          accessTokenExpiresAt: new Date(expiresAt).toISOString(),
          refreshTokenExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          cookiesVerified: cookiesSet,
        });
      } else {
        // Only update access token and expiration
        // First try to get user metadata using the proper cookie functions
        const { getUserMetadata } = await import("@/lib/server/cookies");
        const existingUserMetadata = await getUserMetadata();
        
        let userMetadata: UserMetadata;
        
        if (existingUserMetadata) {
          // Use existing user metadata and update expiration times
          userMetadata = {
            userId: existingUserMetadata.userId,
            email: existingUserMetadata.email,
            roles: existingUserMetadata.roles || [],
            expiresAt, // Access token expiration (already converted by parseApiDateTime in schema)
          };
          
          logger.info("Using existing user metadata for access token update", {
            userId: userMetadata.userId,
            email: userMetadata.email,
            hasRoles: userMetadata.roles.length > 0,
          });
        } else {
          // Fallback to parsing from raw cookies if getUserMetadata fails
          userMetadata = {
            userId: "",
            email: "",
            roles: [],
            expiresAt, // Access token expiration
          };
          
          const currentCookies = request.headers.get("cookie");
          if (currentCookies) {
            const cookiePairs = currentCookies.split(";").map(c => c.trim());
            for (const pair of cookiePairs) {
              const [name, value] = pair.split("=");
              if ((name === AUTH_COOKIE_NAMES.USER_METADATA || name === `__Secure-${AUTH_COOKIE_NAMES.USER_METADATA}`) && value) {
                try {
                  const metadata = JSON.parse(decodeURIComponent(value));
                  userMetadata.userId = metadata.userId || "";
                  userMetadata.email = metadata.email || "";
                  userMetadata.roles = metadata.roles || [];
                  
                  logger.info("Parsed user metadata from raw cookies for access token update", {
                    userId: userMetadata.userId,
                    email: userMetadata.email,
                    hasRoles: userMetadata.roles.length > 0,
                  });
                } catch (e) {
                  logger.warn("Failed to parse user metadata from cookies", {
                    error: e instanceof Error ? e.message : String(e),
                  });
                }
              }
            }
          }
        }
        
        // Validate that we have required user data
        if (!userMetadata.userId || !userMetadata.email) {
          logger.error("Missing required user data for access token update", {
            hasUserId: !!userMetadata.userId,
            hasEmail: !!userMetadata.email,
            hasRoles: userMetadata.roles.length > 0,
          });
          
          return NextResponse.json(
            { message: "Unable to refresh token: missing user information" },
            { status: 500 }
          );
        }
        
        await updateAccessTokenCookie(accessToken, userMetadata);
        
        // Verify cookies were updated
        const { hasAuthCookies } = await import("@/lib/server/cookie-verification");
        const cookiesSet = await hasAuthCookies();
        
        if (!cookiesSet) {
          logger.error("Failed to verify cookies after refresh update", {
            userId: userMetadata.userId,
          });
        }
        
        logger.info("Token refresh successful", {
          userId: userMetadata.userId,
          accessTokenExpiresAt: new Date(expiresAt).toISOString(),
          refreshTokenExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          cookiesVerified: cookiesSet,
        });
      }

      // Return new expiration to client
      return NextResponse.json({
        expiresAt, // Access token expiration (already in milliseconds from parseApiDateTime)
        refreshed: true
      });

    } catch (error) {
      // Handle specific API errors
      if (error instanceof ApiError) {
        const status = error.status || 401;
        
        // Log different error types
        if (status === 401) {
          logger.warn("Refresh token invalid or expired", {
            errorCode: error.errorCode,
            traceId: error.traceId
          });
        } else {
          logger.error("API error during token refresh", {
            message: error.message,
            errorCode: error.errorCode,
            traceId: error.traceId
          });
        }
        
        return NextResponse.json(
          { 
            message: status === 401 ? "Invalid or expired refresh token" : error.message,
            errorCode: error.errorCode,
            traceId: error.traceId
          },
          { status }
        );
      }
      
      throw error; // Re-throw to be caught by outer catch
    }

  } catch (error) {
    logger.error("Unexpected error during token refresh", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}