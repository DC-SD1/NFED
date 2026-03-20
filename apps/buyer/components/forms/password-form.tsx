"use client";

import { Button } from "@cf/ui/components/button";
import { Form } from "@cf/ui/components/form";
import { FormPasswordField } from "@cf/ui/components/form-password-field";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { PasswordRequirements } from "@/components/auth/password-requirements";
import { type PasswordFormData, passwordSchema } from "@/lib/schemas/sign-up";

interface PasswordFormProps {
  onSubmit: (data: PasswordFormData) => void | Promise<void>;
  isLoading?: boolean;
  showTerms?: boolean;
  submitButtonText?: string;
}

export function PasswordForm({
  onSubmit,
  isLoading = false,
  showTerms = true,
  submitButtonText,
}: PasswordFormProps) {
  const t = useTranslations("auth");
  const tValidation = useTranslations();

  const form = useForm<PasswordFormData>({
    resolver: zodResolver(
      passwordSchema((key, values) => tValidation(key as any, values)),
    ),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const password = form.watch("password");
  const confirmPassword = form.watch("confirmPassword");

  useEffect(() => {
    // Only trigger validation if confirmPassword is not empty
    if (confirmPassword !== "") {
      void form.trigger("confirmPassword");
    }
  }, [confirmPassword, form, password]);

  const handleSubmit = async (data: PasswordFormData) => {
    await onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormPasswordField
            name="password"
            label={t("password")}
            placeholder={t("enterPassword")}
          />

          <FormPasswordField
            name="confirmPassword"
            label={t("confirmPassword")}
            placeholder={t("confirmPasswordPlaceholder")}
          />

          {/* Always show password requirements */}
          <PasswordRequirements password={password || ""} />
        </div>
        {/* CAPTCHA Widget */}
        <div id="clerk-captcha"></div>

        <div className="space-y-4">
          {showTerms && (
            <div className="text-center text-sm text-gray-600">
              {t("byCreatingAccount")}{" "}
              <Link href="#" className="font-medium text-gray-900 underline">
                {t("termsOfUse")}
              </Link>{" "}
              {t("and")}{" "}
              <Link href="#" className="font-medium text-gray-900 underline">
                {t("privacyPolicy")}
              </Link>
              .
            </div>
          )}

          <Button
            type="submit"
            className="bg-primary h-12 w-full rounded-xl text-base font-medium text-white hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isLoading || !form.formState.isValid}
          >
            {isLoading ? t("processing") : submitButtonText || t("next")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
