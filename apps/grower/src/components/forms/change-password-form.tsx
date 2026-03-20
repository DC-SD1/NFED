"use client";

import { Button } from "@cf/ui/components/button";
import { Form } from "@cf/ui/components/form";
import { FormPasswordField } from "@cf/ui/components/form-password-field";
import { ChevronRight } from "@cf/ui/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { PasswordRequirements } from "@/components/auth/password-requirements";
import { usePasswordUpdate } from "@/hooks/use-password-update";
import type { ChangePasswordFormData } from "@/lib/schemas/sign-up";
import { changePasswordSchema } from "@/lib/schemas/sign-up";

interface ChangePasswordFormProps {
  isLoading?: boolean;
  submitButtonText?: string;
  userEmail?: string;
}

export function ChangePasswordForm({
  isLoading = false,
  submitButtonText = "Update Password",
  userEmail,
}: ChangePasswordFormProps) {
  const t = useTranslations("auth");
  const tValidation = useTranslations();

  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(
      changePasswordSchema((key, values) => tValidation(key as any, values)),
    ),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const { handleSubmit } = usePasswordUpdate(form);

  const newPassword = form.watch("newPassword");
  const confirmPassword = form.watch("confirmPassword");

  useEffect(() => {
    if (confirmPassword !== "") {
      void form.trigger("confirmPassword");
    }
  }, [confirmPassword, form, newPassword]);

  return (
    <div className="rounded-2xl bg-white p-6 shadow-xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="space-y-6">
            <h1 className="text-sm font-medium tracking-tight">
              Login details
            </h1>
            {userEmail && (
              <div className="flex flex-col text-sm">
                <p className="text-gray-dark font-">Login Email:</p>
                <p className="text-md font-normal">{userEmail}</p>
              </div>
            )}

            <FormPasswordField
              name="currentPassword"
              label={t("currentPassword")}
              placeholder={t("enterCurrentPassword")}
              className="rounded-xl"
            />

            <FormPasswordField
              name="newPassword"
              label={t("newPassword")}
              placeholder={t("enterCurrentPassword")}
              className="rounded-xl"
            />

            <FormPasswordField
              name="confirmPassword"
              label={t("newPassword")}
              placeholder={t("confirmPasswordPlaceholder")}
              className="rounded-xl"
            />

            <PasswordRequirements password={newPassword || ""} />
          </div>

          <div id="clerk-captcha"></div>

          <div className="flex justify-end space-y-4">
            <Button
              type="submit"
              variant="default"
              disabled={isLoading || !form.formState.isValid}
              className="w-full rounded-xl sm:w-auto"
            >
              {isLoading ? t("processing") : submitButtonText}
              <ChevronRight className="ml-2 size-4" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
