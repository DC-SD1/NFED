"use client";

import {
  Button,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@cf/ui";
import { Dialog, DialogContent, DialogTitle } from "@cf/ui/components/dialog";
import { PhoneInput } from "@cf/ui/components/phone-input";
import { ChevronLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import type { Country } from "react-phone-number-input";
import { isValidPhoneNumber, parsePhoneNumber } from "react-phone-number-input";

import { useApiClient } from "@/lib/api";
import { useAuthUser } from "@/lib/stores/auth-store-ssr";
import { useModal } from "@/lib/stores/use-modal";
import { useLocalizedErrorHandler } from "@/lib/utils/localized-error-handler";
import { formatPhoneToE164 } from "@/lib/utils/string-helpers";
import { showErrorToast } from "@/lib/utils/toast";

interface FormData {
  phoneNumber: string;
  reason: string;
}

export default function UpdatePhoneNumberModal() {
  const { isOpen, onClose, type, data, onOpen } = useModal();
  const t = useTranslations("dashboard.profile");
  const e = useTranslations("auth.errors");
  const tAuth = useTranslations("auth");
  const api = useApiClient();
  const { handleError } = useLocalizedErrorHandler();
  const { userId: ownerId } = useAuthUser();

  const getCountryFromPhone = (phone: string): Country => {
    if (phone) {
      try {
        const phoneNumber = parsePhoneNumber(phone);
        return phoneNumber?.country || "GH";
      } catch {
        return "GH";
      }
    }
    return "GH";
  };

  const isModalOpen = isOpen && type === "UpdatePhoneNumber";

  // Initialize state with proper fallbacks
  const [currentCountry, setCurrentCountry] = useState<Country>("GH");

  const form = useForm<FormData>({
    defaultValues: {
      phoneNumber: "",
      reason: "",
    },
    mode: "onChange",
  });

  const { control, handleSubmit, reset, watch } = form;
  const watchedValues = watch();
  const { phoneNumber, reason } = watchedValues;

  // Check if form is complete and valid
  const isFormComplete =
    phoneNumber &&
    reason &&
    reason.trim().length > 0 &&
    isValidPhoneNumber(phoneNumber || "");
  const createOtp = api.useMutation("post", "/otp/create", {
    onSuccess: () => {
      onOpen("OtpVerification", {
        emailAddress: data.emailAddress,
        phoneNumber: form.getValues("phoneNumber"),
      });
    },
    onError: () => {
      showErrorToast(tAuth("otpError"));
    },
  });

  // Update form values and country when modal opens or data changes
  useEffect(() => {
    if (isModalOpen && data) {
      const originalPhone = data.phoneNumber || "";
      const fixedPhone = formatPhoneToE164(originalPhone);

      reset({
        phoneNumber: fixedPhone,
        reason: "",
      });

      if (fixedPhone) {
        const country = getCountryFromPhone(fixedPhone);
        setCurrentCountry(country);
      } else {
        setCurrentCountry("GH");
      }
    }
  }, [isModalOpen, data, reset]);

  if (!isModalOpen) return null;

  const onSubmit = async (formData: FormData) => {
    const phoneNumberResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/check-phone-number-exists?PhoneNumber=${encodeURIComponent(formData.phoneNumber)}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      },
    );

    if (!phoneNumberResponse.ok) {
      handleError("something wrong", e("submit_error"));
      return;
    }

    const phoneNumberResult = await phoneNumberResponse.json();

    if (phoneNumberResult.exists) {
      handleError("phone number already exists", e("invitation_number_exists"));
      return;
    }

    void createOtp.mutateAsync({
      body: {
        userId: ownerId || "",
        email: data?.emailAddress,
        otpType: "PhoneVerification",
        otpStatus: "Pending",
      },
    });
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose} modal>
      <DialogContent className="mx-auto w-[calc(100%-1rem)] !rounded-3xl p-0 sm:max-w-sm md:max-w-2xl">
        <div className="flex flex-col">
          <div className="flex items-center p-3 ">
            <Button
              variant="unstyled"
              size="sm"
              onClick={onClose}
              className="flex items-center gap-2 p-0"
            >
              <ChevronLeft className="text-primary size-5" />
              Back
            </Button>
          </div>

          <div className="px-6 pb-6">
            <DialogTitle></DialogTitle>
            <h2 className="text-center text-2xl font-semibold">
              {t("updateDetails")}
            </h2>
            <p className="text-gray-dark mt-2 text-center ">
              {t("updateDetailsSub")}
            </p>
          </div>

          {/* Form */}
          <FormProvider {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="px-6 pb-6">
              <div className="space-y-6">
                <FormField
                  control={control}
                  name="phoneNumber"
                  rules={{
                    required: "Phone number is required",
                    validate: (value) =>
                      isValidPhoneNumber(value || "") ||
                      "Please enter a valid phone number",
                  }}
                  render={({ field }) => {
                    const handlePhoneChange = (value: string) => {
                      field.onChange(value);
                      if (value) {
                        try {
                          const phoneNumber = parsePhoneNumber(value);
                          if (phoneNumber?.country) {
                            setCurrentCountry(phoneNumber.country);
                          }
                        } catch {
                          //
                        }
                      }
                    };

                    return (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-sm font-semibold">
                          New phone number
                        </FormLabel>
                        <FormControl>
                          <PhoneInput
                            {...field}
                            onChange={handlePhoneChange}
                            defaultCountry={currentCountry}
                            international={false}
                            className="bg-primary-light border-input-border h-12 items-center rounded-xl border border-solid placeholder:text-[#525C4E]"
                            countrySelectProps={{
                              className:
                                "bg-primary-light border border-solid border-input-border rounded-s-md",
                            }}
                            key={currentCountry}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                {/* Reason field */}
                <FormField
                  control={control}
                  name="reason"
                  rules={{
                    required:
                      "Please provide a reason for changing your details",
                    validate: (value) =>
                      value.trim().length > 0 || "Reason cannot be empty",
                  }}
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-semibold">
                        Reason for changing details
                      </FormLabel>
                      <FormControl>
                        <textarea
                          {...field}
                          className="border-input-border bg-primary-light focus:outline-primary placeholder:text-gray-dark min-h-[100px] w-full resize-none rounded-xl border border-solid p-3 text-base"
                          placeholder="Enter your reason"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Buttons */}
              <div className="mt-8 space-y-3 px-5">
                <Button
                  type="submit"
                  disabled={
                    !isFormComplete ||
                    data.phoneNumber === form.getValues("phoneNumber") ||
                    createOtp.isPending
                  }
                  className="bg-primary h-14 w-full rounded-xl text-base font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {createOtp.isPending ? "Processing..." : "Submit"}
                </Button>
                <Button
                  type="button"
                  variant="unstyled"
                  onClick={onClose}
                  className="h-14 w-full text-base font-medium"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </FormProvider>
        </div>
      </DialogContent>
    </Dialog>
  );
}
