import { AUTH_ROUTES, SUCCESS_MESSAGES } from "@/lib/constants/auth";
import { logger } from "@/lib/utils/logger";

import type {
  ResendParams,
  VerificationResult,
  VerificationStrategy,
  VerifyParams,
} from "./types";

export const signupStrategy: VerificationStrategy = {
  verify: async ({
    otp,
    signUp,
  }: VerifyParams): Promise<VerificationResult> => {
    if (!signUp) {
      throw new Error("Sign up instance not available");
    }

    const result = await signUp.attemptEmailAddressVerification({
      code: otp,
    });

    // Map Clerk SignUpResource to our VerificationResult format
    return {
      status: result.status,
      createdSessionId: result.createdSessionId,
      verifications: result.verifications,
      created_user_id: result.createdUserId || null,
      email_address: result.emailAddress || null,
      id: result.id || null,
      phone_number: result.phoneNumber || null,
      first_name: result.firstName || null,
      last_name: result.lastName || null,
      username: result.username || null,
    };
  },

  resend: async ({ signUp }: ResendParams): Promise<void> => {
    if (!signUp) {
      throw new Error("Sign up instance not available");
    }

    await signUp.prepareEmailAddressVerification({
      strategy: "email_code",
    });
  },

  handleSuccess: async ({
    result,
    router,
    additionalActions,
  }): Promise<void> => {
    if (result.status === "complete") {
      // Execute any additional actions (like backend registration)
      if (additionalActions) {
        await additionalActions();
      }

      router.replace(AUTH_ROUTES.ONBOARDING);
    } else {
      logger.warn("Email verification incomplete", {
        status: result.status,
        verifications: result.verifications,
      });
      throw new Error("VERIFICATION_INCOMPLETE");
    }
  },

  getSuccessRoute: () => AUTH_ROUTES.ONBOARDING,

  getResendSuccessMessage: () => SUCCESS_MESSAGES.SIGNUP_RESEND,
};
