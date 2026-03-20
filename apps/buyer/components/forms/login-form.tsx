"use client";

import { cn } from "@cf/ui";
import { Button } from "@cf/ui/components/button";
import { Form, FormInput } from "@cf/ui/components/form";
import { FormPasswordField } from "@cf/ui/components/form-password-field";
import { toast } from "@cf/ui/components/sonner";
import { useAuth, useSignIn } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { AuthDivider } from "@/components/auth/auth-divider";
import type { loginFormData } from "@/lib/schemas/sign-in";
import { loginSchema } from "@/lib/schemas/sign-in";
import { useAuthActions } from "@/lib/stores/auth/auth-store-ssr";
import { useLocalizedErrorHandler } from "@/lib/utils/localized-error-handler";

import { GoogleOAuthButton } from "../auth/google-oauth-button";

export function LoginForm() {
  const tCommon = useTranslations("common");
  const t = useTranslations("auth");
  const params = useParams();
  const locale = typeof params?.locale === "string" ? params.locale : "en";
  // Hooks
  const { isLoaded, signIn, setActive } = useSignIn();
  const { getToken } = useAuth();
  const authActions = useAuthActions();
  const router = useRouter();
  const { handleClerkError } = useLocalizedErrorHandler();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<loginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { handleSubmit, formState } = form;

  const handleFormSubmit = async (data: loginFormData) => {
    // Check if Clerk is loaded
    if (!isLoaded || !signIn) {
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Authenticate with Clerk
      const result = await signIn.create({
        identifier: data.email,
        password: data.password,
      });

      // Step 2: Check if sign-in is complete
      if (result.status === "complete") {
        // Step 3: Finalize Clerk session
        await setActive({ session: result.createdSessionId });

        // Step 4: Get Clerk token and exchange with backend
        const clerkToken = await getToken();
        if (!clerkToken) {
          throw new Error("Failed to get Clerk authentication token");
        }

        const exchangeResult = await authActions.exchangeTokens(clerkToken);

        // Step 5: Check if exchange was successful
        if (exchangeResult.success) {
          // Redirect to a generic dashboard route
          // The useSessionSync hook will handle role-based redirection
          // after ensuring roles are properly loaded
          router.replace(`/${locale}/dashboard`);
        } else {
          // If exchange failed, show error
          toast.error(t("errors.invalid_credentials"));
        }
      } else {
        // Handle incomplete sign-in (e.g., MFA required, email verification, etc.)
        console.log("Sign-in status not complete:", result);

        // Check for specific incomplete statuses
        if (result.status === "needs_second_factor") {
          // 2FA is required but not supported
          toast.error(t("errors.mfa_not_supported"));
        } else if (result.status === "needs_identifier") {
          // Additional identifier needed
          toast.error(t("errors.invalid_credentials"));
        } else if (result.status === "needs_new_password") {
          // Password needs to be reset
          toast.error(t("errors.needs_new_password"));
        } else {
          // Generic incomplete status
          toast.error(t("errors.signin_incomplete"));
        }
      }
    } catch (error) {
      handleClerkError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while Clerk initializes
  if (!isLoaded) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="text-primary size-8 animate-spin" />
      </div>
    );
  }

  // Check if signIn is available after loading
  if (!signIn) {
    return null; // This should rarely happen after isLoaded is true
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <FormInput
            name="email"
            type="email"
            label={t("email")}
            placeholder={t("enterEmail")}
            autoComplete="email"
          />

          <FormPasswordField
            name="password"
            label={t("password")}
            placeholder={t("enterPassword")}
            autoComplete="current-password"
          />

          <div className="flex w-full justify-end">
            <Link
              href={`/${locale}/forgot-password`}
              className="text-foreground inline-flex items-center gap-1 text-sm font-semibold"
            >
              {t("forgotPassword")}
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <Button
            type="submit"
            className={cn("mx-auto flex w-full gap-1 disabled:opacity-50")}
            disabled={!formState.isValid || isLoading || !isLoaded}
          >
            {isLoading ? t("processing") : tCommon("signIn")}
            <ArrowRight className="size-4" />
          </Button>
        </form>
      </Form>

      <AuthDivider />

      <GoogleOAuthButton />
      <div className="flex items-center justify-center">
        <p className="text-foreground flex items-center gap-1 text-sm">
          {t("noAccount")}
          <Link
            href={`/${locale}/sign-up`}
            className="text-primary inline-flex items-center gap-1"
          >
            {tCommon("signUp")}
          </Link>
        </p>
      </div>
    </div>
  );
}
