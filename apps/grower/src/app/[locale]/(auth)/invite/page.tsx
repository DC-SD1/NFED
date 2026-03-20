import { createClerkClient } from "@clerk/backend";
import { redirect } from "next/navigation";
import { useTranslations } from "next-intl";
import { Suspense } from "react";

import { Loader } from "@/components/ui/loader";
import { 
  InvitationTokenError, 
  validateInvitationToken 
} from "@/lib/utils/invitation-token";
import { logger } from "@/lib/utils/logger";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
});

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

async function InviteServerPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;

  let email: string | undefined;
  let errorCode: string | undefined;

  // Priority 1: Try token-based flow (new method)
  const token =
    typeof resolvedSearchParams.token === "string"
      ? resolvedSearchParams.token
      : undefined;

  if (token) {
    try {
      email = validateInvitationToken(token);
      logger.info("Invitation token validated successfully", { email });
    } catch (err) {
      if (err instanceof InvitationTokenError) {
        errorCode = err.code;
        logger.warn("Invitation token validation failed", { 
          code: err.code, 
          message: err.message,
          token 
        });
      } else {
        errorCode = "UNKNOWN_TOKEN_ERROR";
        logger.error("Unexpected error during token validation", { token, err });
      }
      // Redirect immediately with error code
      redirect(`/oops?code=${errorCode}`);
    }
  }

  // Priority 2: Backward compatibility - try legacy email/referrer flow
  if (!email) {
    const legacyEmail =
      typeof resolvedSearchParams.email === "string"
        ? resolvedSearchParams.email
        : undefined;
    const referrer =
      typeof resolvedSearchParams.referrer === "string"
        ? resolvedSearchParams.referrer
        : undefined;

    if (legacyEmail && referrer) {
      logger.warn("Using deprecated email/referrer invitation parameters", {
        email: legacyEmail,
        referrer,
      });
      email = legacyEmail;
    } else if (legacyEmail || referrer) {
      // Partial parameters provided
      logger.error("Incomplete invitation parameters", {
        hasEmail: !!legacyEmail,
        hasReferrer: !!referrer,
      });
      redirect("/oops?code=INVITATION_MISSING_PARAMS");
    }
  }

  // If still no email, redirect with error
  if (!email) {
    redirect("/oops?code=INVITATION_MISSING_PARAMS");
  }
  let success = false;
  try {
    const users = await clerkClient.users.getUserList({
      emailAddress: [email],
    });

    if (users.data.length > 0) {
      const user = users.data[0];
      if (!user) {
        logger.error("Clerk returned null user in data array", { email });
        redirect("/oops?code=CLERK_USER_NOT_FOUND");
      }
      success = true;
      logger.info("User found in Clerk", { email, userId: user.id });
    } else {
      // No user found - this might be expected for new invitations
      logger.info("User not found in Clerk", { email });
      redirect("/oops?code=INVITATION_USER_NOT_FOUND");
    }
  } catch (err) {
    logger.error("Error checking user with Clerk API", { email, err });
    redirect("/oops?code=CLERK_API_ERROR");
  }
  
  if (success) {
    logger.info("Redirecting to OTP page", { email });
    redirect(`/otp?mode=reset&email=${encodeURIComponent(email)}`);
  } else {
    // This should not be reached due to earlier redirects
    logger.warn("Unexpected state: success flag is false", { email });
    redirect("/oops?code=INVITATION_PROCESSING_FAILED");
  }
  
  return null;
}

export default function InvitePageWrapper({ searchParams }: PageProps) {
  const t = useTranslations("common");
  return (
    <Suspense fallback={<Loader message={t("processing_invitation")} />}>
      <InviteServerPage searchParams={searchParams} />
    </Suspense>
  );
}
