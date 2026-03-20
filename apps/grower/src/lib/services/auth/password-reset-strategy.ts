import { AUTH_ROUTES, SUCCESS_MESSAGES } from "@/lib/constants/auth";
import { logger } from "@/lib/utils/logger";

import type {
  ResendParams,
  VerificationResult,
  VerificationStrategy,
  VerifyParams,
} from "./types";

export const passwordResetStrategy: VerificationStrategy = {
  verify: async ({
    otp,
    signIn,
  }: VerifyParams): Promise<VerificationResult> => {
    if (!signIn) {
      throw new Error("Sign in instance not available");
    }

    const result = await signIn.attemptFirstFactor({
      strategy: "reset_password_email_code",
      code: otp,
    });

    // Map Clerk SignInResource to our VerificationResult format
    return {
      status: result.status,
      createdSessionId: result.createdSessionId,
      verifications: null,
      created_user_id: result.id || null,
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
      throw new Error("Email address not found for password reset");
    }

    await signIn.create({
      strategy: "reset_password_email_code",
      identifier: email,
    });
  },

  handleSuccess: async ({ result, router }): Promise<void> => {
    if (result.status === "needs_new_password") {
      router.replace(AUTH_ROUTES.PASSWORD_RESET);
    } else {
      logger.warn("Password reset verification incomplete", {
        status: result.status,
      });
      throw new Error("RESET_VERIFICATION_INCOMPLETE");
    }
  },

  getSuccessRoute: () => AUTH_ROUTES.PASSWORD_RESET,

  getResendSuccessMessage: () => SUCCESS_MESSAGES.RESET_RESEND,
};
