import { NextResponse } from "next/server";

import { getPublicApiClient } from "@/lib/api";
import { ApiError } from "@/lib/errors";
import { mapLegacyRoles, ROLES } from "@/lib/schemas/auth";
import { verifyClerkToken } from "@/lib/server/clerk";
import { setAuthCookies } from "@/lib/server/cookies";
import { logger } from "@/lib/utils/logger";
import type { AuthSession } from "@/types/auth";
import { TokenExchangeResponseSchema } from "@/types/auth";

interface SsoCallbackRequest {
  clerkToken: string;
  isNewUser: boolean;
  userData: {
    email: string;
    firstName: string;
    lastName: string;
    authId: string;
  };
}

/**
 * POST /api/auth/sso-callback
 *
 * Handle OAuth callback from Clerk. Either registers new users or
 * exchanges tokens for existing users.
 */
export async function POST(request: Request) {
  // No CSRF validation needed for SSO callback
  // Security is provided by Clerk token verification

  try {
    const body: SsoCallbackRequest = await request.json();
    const { clerkToken, isNewUser, userData } = body;

    logger.info("SSO callback API route called", {
      hasToken: !!clerkToken,
      isNewUser,
      authId: userData.authId,
      email: userData.email,
      willRegister: isNewUser === true,
    });

    // Verify the Clerk token
    const clerkUser = await verifyClerkToken(clerkToken);
    if (!clerkUser || clerkUser.sub !== userData.authId) {
      logger.error("Invalid Clerk token or user mismatch", {
        providedAuthId: userData.authId,
        tokenSub: clerkUser?.sub,
        tokenVerified: !!clerkUser,
      });
      return NextResponse.json(
        { message: "Invalid authentication token" },
        { status: 401 },
      );
    }

    const api = getPublicApiClient();

    // Try login first - this handles both existing and new users
    logger.info("Starting OAuth authentication flow", {
      email: userData.email,
      authId: userData.authId,
    });

    let tokenData: any = null;
    let userIsNew = false;

    try {
      // Step 1: Attempt login/token exchange first
      const tokenResponse = await api.client.POST("/users/login", {
        body: {
          token: clerkToken,
        },
      });

      if (tokenResponse.error) {
        const errorDetails = tokenResponse.error;
        const firstError = errorDetails.errors?.[0];

        // Check if the error is USER_NOT_FOUND
        if (
          firstError?.code === "USER_NOT_FOUND" ||
          (tokenResponse.response?.status === 404 &&
            firstError?.message?.toLowerCase().includes("user"))
        ) {
          logger.info(
            "User not found in backend, proceeding with registration",
            {
              email: userData.email,
              authId: userData.authId,
            },
          );

          // Step 2: Register the new user
          const registrationResponse = await api.client.POST(
            "/users/register",
            {
              body: {
                email: userData.email,
                authId: userData.authId,
                firstName: userData.firstName,
                lastName: userData.lastName,
                phoneNumber: undefined, // OAuth users might not have phone
              },
            },
          );

          if (registrationResponse.error) {
            const regError = registrationResponse.error;
            const firstRegError = regError.errors?.[0];

            logger.error("OAuth user registration failed", {
              error: regError,
              errorCode: firstRegError?.code,
            });

            throw new ApiError(
              firstRegError?.message || "Registration failed",
              {
                status: registrationResponse.response?.status,
                errorCode: firstRegError?.code,
                errorType: String(firstRegError?.type),
                traceId: regError.traceId,
              },
            );
          }

          logger.info("OAuth user registered successfully", {
            userId: registrationResponse.data?.userId,
          });

          userIsNew = true;

          // Step 3: Retry login after successful registration
          const retryResponse = await api.client.POST("/users/login", {
            body: {
              token: clerkToken,
            },
          });

          if (retryResponse.error) {
            logger.error("OAuth token exchange failed after registration", {
              error: retryResponse.error,
            });
            throw new ApiError("Token exchange failed after registration", {
              status: retryResponse.response?.status,
            });
          }

          tokenData = retryResponse.data;
        } else {
          // Other errors - throw them
          logger.error("OAuth token exchange failed", {
            error: errorDetails,
            errorCode: firstError?.code,
          });

          throw new ApiError(firstError?.message || "Token exchange failed", {
            status: tokenResponse.response?.status,
            errorCode: firstError?.code,
            errorType: String(firstError?.type),
            traceId: errorDetails.traceId,
          });
        }
      } else {
        // Login successful on first attempt
        tokenData = tokenResponse.data;
      }

      // Validate the response
      const responseValidation =
        TokenExchangeResponseSchema.safeParse(tokenData);

      if (!responseValidation.success) {
        logger.error("Invalid backend response format", {
          errors: responseValidation.error.flatten(),
          data: tokenData,
        });
        return NextResponse.json(
          { message: "Invalid server response" },
          { status: 500 },
        );
      }

      tokenData = responseValidation.data;

      // Map legacy role names from backend (e.g., "Farmer" -> "FarmOwner")
      let mappedRoles = mapLegacyRoles(tokenData.roles || []);

      // Ensure BUYER role is present for all users in the buyer app
      // If user doesn't have BUYER role, set it as their only role
      if (!mappedRoles.includes(ROLES.BUYER)) {
        logger.info(
          "User doesn't have BUYER role, setting BUYER role for buyer app",
          {
            userId: tokenData.userId,
            originalRoles: mappedRoles,
            isNewUser: userIsNew,
          },
        );
        mappedRoles = [ROLES.BUYER];
      }

      // Create auth session
      const session: AuthSession = {
        accessToken: tokenData.accessToken,
        refreshToken: tokenData.refreshToken,
        userId: tokenData.userId,
        email: tokenData.email,
        roles: mappedRoles,
        expiresAt: tokenData.expiresAt,
      };

      // Set auth cookies
      await setAuthCookies(session);

      // Fetch user profile to get country information
      // The login endpoint doesn't return country, so we need to fetch it separately
      let country: string | null = null;
      try {
        const userProfileResponse = await api.client.GET("/users/get-by-id", {
          headers: {
            Authorization: `Bearer ${tokenData.accessToken}`,
          },
        });

        if (userProfileResponse.data) {
          const profileData = userProfileResponse.data as Record<
            string,
            unknown
          >;
          country = (profileData.country as string | null) || null;
          logger.info("Fetched user profile for country", {
            userId: tokenData.userId,
            country,
          });
        }
      } catch (profileError) {
        logger.warn("Failed to fetch user profile for country", {
          userId: tokenData.userId,
          error: profileError,
        });
        // Continue without country - will redirect to country page
      }

      logger.info("OAuth authentication successful", {
        userId: tokenData.userId,
        email: tokenData.email,
        isNewUser: userIsNew,
        country,
      });

      // Return response indicating user status
      return NextResponse.json({
        success: true,
        isNewUser: userIsNew,
        userId: tokenData.userId,
        email: tokenData.email,
        roles: mappedRoles,
        expiresAt: tokenData.expiresAt,
        country,
      });
    } catch (error) {
      logger.error("SSO callback error", error);

      if (error instanceof ApiError) {
        return NextResponse.json(
          {
            message: error.message,
            errorCode: error.errorCode,
            traceId: error.traceId,
          },
          { status: error.status || 500 },
        );
      }

      return NextResponse.json(
        { message: "Internal server error" },
        { status: 500 },
      );
    }
  } catch (error) {
    logger.error("SSO callback error", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
