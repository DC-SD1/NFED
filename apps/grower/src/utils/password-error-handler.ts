import type { UseFormReturn } from "react-hook-form";

import type { ChangePasswordFormData } from "@/lib/schemas/sign-up";
import { showErrorToast } from "@/lib/utils/toast";

interface PasswordError {
  errors?: {
    code?: string;
    message?: string;
    meta?: {
      param_name?: string;
    };
  }[];
  message?: string;
}

const ERROR_MAPPINGS = {
  form_password_incorrect: {
    toast: "Your current password is incorrect. Please try again.",
    field: "currentPassword" as keyof ChangePasswordFormData,
    message: "Current password is incorrect",
  },
  form_password_validation_failed: {
    current_password: {
      toast: "Your current password is incorrect. Please try again.",
      field: "currentPassword" as keyof ChangePasswordFormData,
      message: "Current password is incorrect",
    },
    new_password: {
      toast: "New password doesn't meet security requirements.",
      field: "newPassword" as keyof ChangePasswordFormData,
      message: "Password doesn't meet requirements",
    },
  },
  form_password_pwned: {
    toast:
      "This password has been found in a data breach. Please choose a different password.",
    field: "newPassword" as keyof ChangePasswordFormData,
    message: "Password found in data breach",
  },
  form_password_size_in_bytes: {
    toast: "Password is too long. Please choose a shorter password.",
    field: "newPassword" as keyof ChangePasswordFormData,
    message: "Password is too long",
  },
} as const;

export function handlePasswordError(
  error: PasswordError,
  form: UseFormReturn<ChangePasswordFormData>,
): void {
  const errorCode = error?.errors?.[0]?.code;
  const paramName = error?.errors?.[0]?.meta?.param_name;
  const errorMessage = error?.errors?.[0]?.message || "";

  if (errorCode && errorCode in ERROR_MAPPINGS) {
    const mapping = ERROR_MAPPINGS[errorCode as keyof typeof ERROR_MAPPINGS];

    if (errorCode === "form_password_validation_failed") {
      const validationMapping =
        mapping as typeof ERROR_MAPPINGS.form_password_validation_failed;

      if (
        paramName === "current_password" ||
        errorMessage.includes("Incorrect password")
      ) {
        const config = validationMapping.current_password;
        showErrorToast(config.toast);
        form.setError(config.field, {
          type: "manual",
          message: config.message,
        });
        return;
      }

      if (paramName === "new_password") {
        const config = validationMapping.new_password;
        showErrorToast(config.toast);
        form.setError(config.field, {
          type: "manual",
          message: config.message,
        });
        return;
      }
    } else {
      const config = mapping as {
        toast: string;
        field: keyof ChangePasswordFormData;
        message: string;
      };
      showErrorToast(config.toast);
      form.setError(config.field, {
        type: "manual",
        message: config.message,
      });
      return;
    }
  }

  if (error?.message === "User not found. Please sign in again.") {
    showErrorToast("User not found. Please sign in again.");
    return;
  }
  showErrorToast("Failed to update password. Please try again.");
}
