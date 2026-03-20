"use client";

import {
  Form,
  FormControl,
  FormField,
  FormInput,
  FormItem,
  FormLabel,
  FormMessage,
} from "@cf/ui";
import { PhoneInput } from "@cf/ui/components/phone-input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { type Country, parsePhoneNumber } from "react-phone-number-input/min";

import PrimaryButton from "@/components/buttons/primary-button";
import AppDialog from "@/components/modals/app-dialog";
import AppDialogContent from "@/components/modals/app-dialog-content";
import { useApiClient } from "@/lib/api";
import type { BuyerInvitationData } from "@/lib/schemas/invitation-schema";
import { BuyerInvitationSchema } from "@/lib/schemas/invitation-schema";
import { useModal } from "@/lib/stores/use-modal";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toast";

const InviteBuyersDialog = () => {
  const { isOpen, type, onClose } = useModal();
  const t = useTranslations("customerManagement.buyer.inviteBuyer");
  const tt = useTranslations("common.errors");
  const isModalOpen = isOpen && type === "InviteBuyer";
  const [currentCountry, setCurrentCountry] = useState<Country>("GH");
  const api = useApiClient();
  const queryClient = useQueryClient();

  const form = useForm<BuyerInvitationData>({
    resolver: zodResolver(BuyerInvitationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
    },
  });
  const { handleSubmit, control, formState, reset } = form;

  const { mutate: _mutate, isPending: _isPending } = api.useMutation(
    "post",
    "/customer-management/buyers/invite" as any,
    {
      onSuccess: async (data: any) => {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: ["get", "/customer-management/buyers"],
          }),
          queryClient.invalidateQueries({
            queryKey: ["get", "/customer-management/buyers/metrics"],
          }),
        ]);
        showSuccessToast(data?.message ?? t("successMessage"));

        reset();
        setCurrentCountry("GH");
        onClose();
      },
      onError: (error: any) => {
        showErrorToast(error?.message ?? tt("unknown_error"));
      },
    },
  );

  if (!isModalOpen) return null;

  const handleFormSubmit = (_data: BuyerInvitationData) => {
    showSuccessToast(t("successMessage"));
    reset();
    setCurrentCountry("GH");
    onClose();
  };

  const handleCloseModal = () => {
    reset();
    setCurrentCountry("GH");
    onClose();
  };

  return (
    <AppDialog
      key={"invite-buyers-dialog"}
      isOpen={isOpen}
      size={"large"}
      title={t("title")}
      closeOnBackground={false}
      onOpenChange={(_) => {
        handleCloseModal();
      }}
      contentClassName={"pt-0 pb-6"}
      content={
        <>
          <AppDialogContent className={"flex flex-col gap-4"}>
            <Form {...form}>
              <div className="space-y-4">
                <div
                  className={
                    "flex w-full flex-col items-center gap-4 sm:flex-row"
                  }
                >
                  <div className={"w-full sm:w-1/2"}>
                    <FormInput
                      name={"firstName"}
                      label={t("firstName")}
                      placeholder={t("firstNamePlaceholder")}
                    />
                  </div>

                  <div className={"w-full sm:w-1/2"}>
                    <FormInput
                      name={"lastName"}
                      label={t("lastName")}
                      placeholder={t("lastNamePlaceholder")}
                    />
                  </div>
                </div>

                <FormInput
                  name={"email"}
                  label={t("email")}
                  placeholder={t("emailPlaceholder")}
                />

                <FormField
                  control={control}
                  name="phoneNumber"
                  render={({ field }) => {
                    const handlePhoneChange = (value: string) => {
                      field.onChange(value);
                      if (value) {
                        try {
                          const phone = parsePhoneNumber(value);
                          if (phone?.country) {
                            setCurrentCountry(phone.country);
                          }
                        } catch {
                          // Keep current country if parsing fails
                        }
                      }
                    };
                    return (
                      <FormItem className="w-full space-y-2">
                        <FormLabel>{t("phoneNumber")}</FormLabel>
                        <FormControl>
                          <PhoneInput
                            {...field}
                            onChange={handlePhoneChange}
                            defaultCountry={currentCountry}
                            international={false}
                            placeholder={t("phoneNumberPlaceholder")}
                            className="h-10 w-full items-center rounded-md bg-primary-light placeholder:text-[#525C4E]"
                            countrySelectProps={{
                              className: "bg-primary-light h-10 rounded-s-md",
                            }}
                            key={currentCountry}
                          />
                        </FormControl>
                        <FormMessage className={"text-xs font-normal"} />
                      </FormItem>
                    );
                  }}
                />
              </div>
            </Form>

            <div>
              <hr className={"-mx-10 mb-4"} />
              <PrimaryButton
                onClick={() => {
                  void handleSubmit(handleFormSubmit)();
                }}
                disabled={!formState.isValid}
                buttonContent={t("inviteButton")}
                className="w-full rounded-xl px-8 text-white"
              />
            </div>
          </AppDialogContent>
        </>
      }
    />
  );
};

export default InviteBuyersDialog;
