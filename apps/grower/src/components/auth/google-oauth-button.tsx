"use client";

import { cn } from "@cf/ui";
import { Button } from "@cf/ui/components/button";
import { toast } from "@cf/ui/components/sonner";
import { GoogleColored, Spinner } from "@cf/ui/icons";
import { useAuth, useClerk, useSignIn, useUser } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { useLocalizedErrorHandler } from "@/lib/utils/localized-error-handler";
import { logger } from "@/lib/utils/logger";

interface GoogleOAuthButtonProps {
  /**
   * Optional className for additional styling
   */
  className?: string;
  /**
   * Whether the button should be disabled
   */
  disabled?: boolean;
  /**
   * Optional label override
   */
  label?: string;
  /**
   * Optional button text override
   */
  text?: string;
}

/**
 * Unified Google OAuth button that handles both sign-in and sign-up flows.
 * Clerk's OAuth provider automatically handles the transfer flow - if a user
 * attempts to sign in but doesn't exist, they'll be registered automatically.
 */
export function GoogleOAuthButton({
  className = "",
  disabled = false,
  label,
  text,
}: GoogleOAuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations("auth");
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { signOut } = useClerk();
  const { user } = useUser();
  const { signIn, isLoaded: signInLoaded } = useSignIn();
  const { handleError } = useLocalizedErrorHandler();

  const handleGoogleOAuth = async () => {
    try {
      setIsLoading(true);

      if (!isLoaded) {
        throw new Error("Authentication is not initialized");
      }

      // If Clerk says user is signed in but app tokens may be missing,
      // attempt a silent exchange to sync cookies. If it fails, log out.
      if (isSignedIn) {
        try {
          logger.info(
            "User already signed in with Clerk; attempting token exchange",
          );

          const clerkToken = await getToken();
          if (!clerkToken) throw new Error("Failed to obtain Clerk token");

          const displayName =
            user?.firstName ||
            user?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
            undefined;
          const name = displayName ?? t("you");
          toast.info(
            t("sessionSync.welcomeBack", { name, comma: name ? "," : "" }),
          );

          const res = await fetch("/api/auth/exchange", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ clerkToken }),
          });

          if (!res.ok) {
            throw new Error(`Exchange failed: ${res.status}`);
          }

          toast.success(t("sessionSync.readyRedirect"));
          // Cookies are set by the route; refresh to continue
          window.location.reload();
          return;
        } catch (e) {
          logger.warn(
            "Silent token exchange failed; signing out to reset session",
            { error: e },
          );
          toast.error(t("sessionSync.syncFailedSigningOut"));
          await signOut();
          // After signOut, Clerk will redirect according to configuration
          setIsLoading(false);
          return;
        }
      }

      logger.info("Initiating Google OAuth flow");

      if (!signIn || !signInLoaded) {
        throw new Error("SignIn is not initialized");
      }

      // Use signIn for OAuth as it handles both new and existing users
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/sso-callback",
      });
    } catch (error) {
      logger.error("Google OAuth initiation failed", error);
      handleError(error, t("errors.oauthFailed", { provider: "Google" }));
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className={cn(
        "hover:bg-primary mx-auto h-12 w-full text-base font-medium",
        className,
      )}
      onClick={handleGoogleOAuth}
      disabled={disabled || isLoading || !isLoaded}
    >
      {isLoading ? (
        <Spinner className="mr-2 size-5 animate-spin" />
      ) : (
        <GoogleColored className="mr-2 size-5" />
      )}
      {text || label || t("continueWithGoogle")}
    </Button>
  );
}
