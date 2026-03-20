import { useReverification, useUser } from "@clerk/nextjs";
import { isReverificationCancelledError } from "@clerk/nextjs/errors";
import { useCallback } from "react";
import type { UseFormReturn } from "react-hook-form";

import type { ChangePasswordFormData } from "@/lib/schemas/sign-up";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toast";
import { handlePasswordError } from "@/utils/password-error-handler";

export function usePasswordUpdate(form: UseFormReturn<ChangePasswordFormData>) {
  const { user } = useUser();

  const updatePasswordFetcher = async (data: ChangePasswordFormData) => {
    if (!user) {
      throw new Error("User not found. Please sign in again.");
    }

    return await user.updatePassword({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
      signOutOfOtherSessions: true,
    });
  };

  const enhancedUpdatePassword = useReverification(updatePasswordFetcher);

  const handleSubmit = useCallback(
    async (data: ChangePasswordFormData) => {
      if (!user) {
        showErrorToast("User not found. Please sign in again.");
        return;
      }

      try {
        await enhancedUpdatePassword(data);
        showSuccessToast("Password updated successfully!");
        form.reset();
      } catch (error: any) {
        if (isReverificationCancelledError(error)) {
          showErrorToast("Password change was cancelled.");
          return;
        }

        handlePasswordError(error, form);
      }
    },
    [user, enhancedUpdatePassword, form],
  );

  return { handleSubmit };
}
