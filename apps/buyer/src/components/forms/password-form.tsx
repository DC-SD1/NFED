"use client";

import { Button } from "@cf/ui/components/button";
import { Form } from "@cf/ui/components/form";
import { FormCheckbox } from "@cf/ui/components/form-checkbox";
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
  submitButtonText?: string;
}

export function PasswordForm({
  onSubmit,
  isLoading = false,
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
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-10">
        <div className="space-y-6">
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

            {/* Only show password requirements when user starts typing */}
            {password && <PasswordRequirements password={password} />}
          </div>
          {/* CAPTCHA Widget */}
          <div id="clerk-captcha"></div>

          <FormCheckbox
            name="terms"
            label={
              <p className="-mt-2 text-sm text-gray-600">
                {t("agreeTo")}{" "}
                <Link href="#" className="font-semibold text-[#4B908B]">
                  {t("termsAndConditions")}
                </Link>{" "}
                and{" "}
                <Link href="#" className="font-semibold text-[#4B908B]">
                  {t("privacyPolicy")}
                </Link>
              </p>
            }
            className="data-[state=checked]:border-[#4B908B] data-[state=checked]:bg-[#4B908B]"
          />
        </div>

        <Button
          type="submit"
          className="hover:bg-primary/90 w-full disabled:cursor-not-allowed disabled:opacity-50 "
          disabled={isLoading || !form.formState.isValid}
        >
          {isLoading ? t("processing") : submitButtonText || t("next")}
        </Button>
      </form>
    </Form>
  );
}
