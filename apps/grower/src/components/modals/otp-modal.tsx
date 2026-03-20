"use client";

import { Dialog, DialogContent, DialogTitle } from "@cf/ui/components/dialog";
import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useTranslations } from "next-intl";

import mailIcon from "@/assets/images/mail.png";
import { useApiClient } from "@/lib/api";
import { useAuthUser } from "@/lib/stores/auth-store-ssr";
import { useModal } from "@/lib/stores/use-modal";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toast";

import { OtpForm } from "../forms/otp-form";

interface OtpModalProps {
  mode?: "signup" | "reset" | "verify";
}

export default function OtpModal({ mode = "signup" }: OtpModalProps) {
  const { isOpen, onClose, type, data } = useModal();
  const tAlt = useTranslations("alt");
  const t = useTranslations("auth");
  const queryClient = useQueryClient();

  const isModalOpen = isOpen && type === "OtpVerification";
  const api = useApiClient();
  const { userId: ownerId } = useAuthUser();

  const getPageTitle = () => {
    switch (mode) {
      case "reset":
        return t("resetPasswordVerification");
      case "verify":
        return t("loginVerification");
      default:
        return t("otpVerification");
    }
  };

  const updateOwnerNumber = api.useMutation(
    "patch",
    "/users/{userId}/phone-number",
    {
      onSuccess: async () => {
        showSuccessToast(t("updateNumberSuccess"));

        await queryClient.invalidateQueries({
          queryKey: ["get", "/users/get-by-id"],
        });

        onClose();
      },
      onError: (error) => {
        const errorMessage = error.errors?.[0]?.message ?? "";
        if (
          errorMessage.includes(
            "Phone numbers from this country (Ghana) are currently not supported",
          )
        ) {
          showErrorToast(t("ghanaNumberError"));
          return;
        }
        showErrorToast(t("updatePhoneError"));
      },
    },
  );

  const createOtp = api.useMutation("post", "/otp/create", {
    onSuccess: async () => {
      showSuccessToast(t("otpResendSuccess"));
    },
    onError: () => {
      showErrorToast(t("otpError"));
    },
  });

  const verifyOtp = api.useMutation("post", "/otp/verify", {
    onSuccess: async () => {
      updateOwnerNumber.mutate({
        params: { path: { userId: ownerId || "" } },
        body: {
          newPhoneNumber: data?.phoneNumber,
        },
      });
    },
    onError: (error: any) => {
      if (error?.errors && Array.isArray(error.errors)) {
        const firstError = error.errors[0];

        const errorMessage = firstError?.message ?? "";
        if (errorMessage.includes("invalid or has expired")) {
          showErrorToast(t("otpIncorrect"));
          return;
        }
        if (errorMessage.includes("not found or already used")) {
          showErrorToast(t("otpNotFound"));
          return;
        }
      }

      showErrorToast(t("otpFailed"));
    },
  });

  const customOtpAction = {
    verify: async (otp: string) => {
      verifyOtp.mutate({
        body: {
          userId: ownerId || "",
          otpCode: otp,
        },
      });
    },

    resend: async () => {
      void createOtp.mutateAsync({
        body: {
          userId: ownerId || "",
          email: data?.emailAddress,
          otpType: "PhoneVerification",
          otpStatus: "Pending",
        },
      });
    },
  };

  if (!isModalOpen) return null;

  return (
    <Dialog
      open={isModalOpen}
      onOpenChange={!updateOwnerNumber.isPending ? onClose : undefined}
      modal
    >
      <DialogContent className="mx-auto w-[calc(100%-1rem)] !rounded-2xl p-4 sm:max-w-sm md:max-w-xl">
        <div className="flex flex-col">
          {/* Main content */}
          <div className="px-6 pb-6">
            <DialogTitle className="sr-only">{getPageTitle()}</DialogTitle>

            <div className="space-y-6">
              {/* Mail icon */}
              <div className="flex justify-center">
                <Image
                  src={mailIcon}
                  alt={tAlt("mailIcon")}
                  width={120}
                  height={120}
                  className="mb-4"
                />
              </div>

              <div className="space-y-2 text-center">
                <h1 className="text-2xl font-bold tracking-tight">
                  {getPageTitle()}
                </h1>
              </div>

              {/* Use OtpForm with custom action when email is provided, otherwise use Clerk */}
              <OtpForm
                mode={mode}
                email={data?.emailAddress}
                action={data?.emailAddress ? customOtpAction : undefined}
                isExternalLoading={updateOwnerNumber.isPending}
                isResendingExternal={createOtp.isPending}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
