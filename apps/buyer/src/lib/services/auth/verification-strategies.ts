import type { AuthMode } from "@/lib/constants/auth";

import { loginVerificationStrategy } from "./login-verification-strategy";
import { passwordResetStrategy } from "./password-reset-strategy";
import { signupStrategy } from "./signup-strategy";
import type { VerificationStrategy } from "./types";

export const verificationStrategies: Record<AuthMode, VerificationStrategy> = {
  signup: signupStrategy,
  reset: passwordResetStrategy,
  verify: loginVerificationStrategy,
};

export { type ResendParams, type VerificationResult,type VerificationStrategy, type VerifyParams } from "./types";