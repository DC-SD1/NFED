"use client";

import { Form, FormInput } from "@cf/ui";
import {toast} from "@cf/ui/components/sonner";
import {useAuth, useClerk, useSignIn, useUser} from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useTranslations } from "next-intl";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

import PrimaryButton from "@/components/buttons/primary-button";
import type { AuthData } from "@/lib/schemas/auth-schema";
import { AuthSchema } from "@/lib/schemas/auth-schema";
import { useLocalizedErrorHandler } from "@/lib/utils/localized-error-handler";
import { logger } from "@/lib/utils/logger";
import { ImageAssets } from "@/utils/image-assets";

export default function AuthFormContent() {
  const t = useTranslations("auth");
  const [isLoading, setIsLoading] = useState(false);
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { signIn, isLoaded: signInLoaded } = useSignIn();
  const { handleError } = useLocalizedErrorHandler();
  const { user } = useUser();
  const { signOut } = useClerk();

  const form = useForm<AuthData>({
    resolver: zodResolver(AuthSchema),
    defaultValues: {
      email: "",
    },
  });

  const { handleSubmit, formState } = form;

  const handleAlreadySignedIn = async() => {
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
    } catch (e) {
      logger.warn(
          "Silent token exchange failed; signing out to reset session",
          { error: e },
      );
      toast.error(t("sessionSync.syncFailedSigningOut"));
      await signOut();
      // After signOut, Clerk will redirect according to configuration
      setIsLoading(false);
    }
  }

  const handleFormSubmit = async (data: AuthData) => {
    try {
      setIsLoading(true);

      if (!isLoaded) {
        throw new Error("Authentication is not initialized");
      }

      // If already signed in, don't do anything
      if (isSignedIn) {
        await handleAlreadySignedIn();
        return;
      }

      logger.info("Initiating Microsoft OAuth flow");

      if (!signIn || !signInLoaded) {
        throw new Error("SignIn is not initialized");
      }

      // Use signIn for OAuth as it handles both new and existing users
      await signIn.authenticateWithRedirect({
        strategy: "saml",
        identifier: data.email,
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/sso-callback",
      });
    } catch (error) {
      logger.error("Microsoft OAuth initiation failed", error);
      handleError(error, t("errors.oauthFailed", { provider: "Microsoft" }));
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Form {...form}>
        <div className="space-y-6">
          <FormInput
            type={"email"}
            name="email"
            label={t("email")}
            placeholder={t("placeholder")}
            className={"h-10"}
          />
          <PrimaryButton
            type={"button"}
            onClick={() => {
              void handleSubmit(handleFormSubmit)();
            }}
            className="w-full justify-center gap-4 bg-[#E8EBE1] text-base font-semibold text-[#1A5514] hover:bg-[#E8EBE1]"
            aria-label="Continue with Microsoft"
            buttonContent={
              <>
                {!isLoading && (
                  <Image
                    src={ImageAssets.MICROSOFT}
                    alt="microsoft"
                    width={24}
                    height={24}
                  />
                )}
                {t("signInButton")}
              </>
            }
            disabled={!formState.isValid}
            isLoading={isLoading}
          />
        </div>
      </Form>
    </div>
  );
}
