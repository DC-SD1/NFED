import type { SignInResource, SignUpResource } from "@clerk/types";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export interface VerifyParams {
  otp: string;
  signUp?: SignUpResource | null;
  signIn?: SignInResource | null;
  setActive?: (params: { session: string | null }) => Promise<void>;
}

export interface ResendParams {
  signUp?: SignUpResource | null;
  signIn?: SignInResource | null;
  email?: string;
}

export interface VerificationResult {
  status: string | null;
  createdSessionId?: string | null;
  verifications?: any;
  created_user_id: string | null;
  email_address: string | null;
  id: string | null;
  phone_number: string | null;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
}

export interface SuccessHandlerParams {
  result: VerificationResult;
  router: AppRouterInstance;
  additionalActions?: () => Promise<void>;
  setActive?: (params: { session: string | null }) => Promise<void>;
}

export interface VerificationStrategy {
  verify: (params: VerifyParams) => Promise<VerificationResult>;
  resend: (params: ResendParams) => Promise<void>;
  handleSuccess: (params: SuccessHandlerParams) => Promise<void>;
  getSuccessRoute: () => string;
  getResendSuccessMessage: () => string;
}
