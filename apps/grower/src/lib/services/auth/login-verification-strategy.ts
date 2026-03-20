import { AUTH_ROUTES, ERROR_CODES, SUCCESS_MESSAGES } from "@/lib/constants/auth";
import { logger } from "@/lib/utils/logger";

import type { ResendParams, VerificationResult,VerificationStrategy, VerifyParams } from "./types";

export const loginVerificationStrategy: VerificationStrategy = {
  verify: async ({ otp, signIn }: VerifyParams): Promise<VerificationResult> => {
    if (!signIn) {
      throw new Error("Sign in instance not available");
    }

    const result = await signIn.attemptFirstFactor({
      strategy: "email_code",
      code: otp,
    });

    // Map Clerk SignInResource to our VerificationResult format
    return {
      status: result.status,
      createdSessionId: result.createdSessionId,
      verifications: null,
      created_user_id: null,
      email_address: result.identifier || null,
      id: result.id || null,
      phone_number: null,
      first_name: result.userData?.firstName || null,
      last_name: result.userData?.lastName || null,
      username: null,
    };
  },

  resend: async ({ signIn, email }: ResendParams): Promise<void> => {
    if (!signIn) {
      throw new Error("Sign in instance not available");
    }

    if (!email) {
      throw new Error("Email address not found for verification");
    }

    await signIn.create({
      identifier: email,
      strategy: "email_code",
    });
  },

  handleSuccess: async ({
    result,
    router,
    setActive
  }): Promise<void> => {
    if (result.status === "complete") {
      if (result.createdSessionId && setActive) {
        await setActive({ session: result.createdSessionId });
        router.replace(AUTH_ROUTES.DASHBOARD);
      } else {
        const error = new Error("Login verification successful but session creation failed.");
        (error as any).code = ERROR_CODES.LOGIN_SESSION_CREATION_FAILED;
        throw error;
      }
    } else {
      logger.warn("Login verification incomplete", {
        status: result.status,
      });
      throw new Error("LOGIN_VERIFICATION_INCOMPLETE");
    }
  },

  getSuccessRoute: () => AUTH_ROUTES.DASHBOARD,
  
  getResendSuccessMessage: () => SUCCESS_MESSAGES.VERIFY_RESEND,
};