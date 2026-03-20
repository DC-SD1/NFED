"use client";

import { Button, cn } from "@cf/ui";
import { PhoneInput } from "@cf/ui/components/phone-input";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, X } from "lucide-react";
import { useTranslations } from "next-intl";
import React, { useState } from "react";

import PrimaryButton from "@/components/buttons/primary-button";
import InputComponent from "@/components/input-components/input-component";
import AppDialog from "@/components/modals/app-dialog";
import AppDialogContent from "@/components/modals/app-dialog-content";
import AppDialogFooter from "@/components/modals/app-dialog-footer";
import { useApiClient } from "@/lib/api";
import { useModal } from "@/lib/stores/use-modal";
import {
  showErrorToast,
  showInfoToast,
  showSuccessToast,
} from "@/lib/utils/toast";
import {
  emailAlreadyExists,
  hasDuplicateEmails,
  hasDuplicatePhoneNumbers,
  hasInvalidEmails,
  hasInvalidPhoneNumbers,
  hasMissingFields,
  isValidEmail,
  isValidPhoneNumber,
  phoneNumberAlreadyExists,
} from "@/utils/helpers/grower-invitation-helpers";

const InviteFormalGrowerDialog = () => {
  const { isOpen, type, onClose } = useModal();
  const t = useTranslations(
    "customerManagement.formalGrower.inviteFormalGrower",
  );
  const tt = useTranslations("common.errors");
  const isModalOpen = isOpen && type === "InviteFormalGrower";
  const [growers, setGrowers] = useState([{ email: "", phoneNumber: "" }]);
  const api = useApiClient();
  const queryClient = useQueryClient();

  const { mutate, isPending } = api.useMutation(
    "post",
    "/customer-management/formal-growers/invite",
    {
      onSuccess: async (data: any) => {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: ["get", "/customer-management/formal-growers/metrics"],
          }),
          queryClient.invalidateQueries({
            queryKey: ["get", "/customer-management/formal-growers"],
          }),
        ]);
        showSuccessToast(
          data?.message ??
            `${filledInvites.length} ${filledInvites.length === 1 ? "User" : "Users"} invited successfully`,
        );

        onClose();
      },
      onError: (error: any) => {
        showErrorToast(error?.message ?? tt("unknown_error"));
      },
    },
  );

  const addNew = () => {
    if (hasMissingFields(growers)) {
      showInfoToast("Please fill in all fields");
      return;
    }

    const newGrower = {
      email: "",
      phoneNumber: "",
    };
    setGrowers((prev) => [...prev, newGrower]);
  };

  const removeGrower = (index: number) => {
    if (growers.length > 1) {
      setGrowers((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const updateGrower = (index: number, field: string, value: string) => {
    setGrowers((prev) =>
      prev.map((user, i) => (i === index ? { ...user, [field]: value } : user)),
    );
  };

  const filledInvites = growers.filter(
    (user) => user.email.trim() !== "" && user.phoneNumber.trim() !== "",
  );

  if (!isModalOpen) return null;

  const handleSendInvite = () => {
    if (hasInvalidEmails(growers)) {
      showInfoToast(t("invalidEmails"));
      return;
    }
    if (hasInvalidPhoneNumbers(growers)) {
      showInfoToast(t("invalidPhoneNumbers"));
      return;
    }

    if (hasDuplicateEmails(growers)) {
      showInfoToast(t("duplicateEmails"));
      return;
    }

    if (hasDuplicatePhoneNumbers(growers)) {
      showInfoToast(t("duplicatePhoneNumbers"));
      return;
    }

    if (hasMissingFields(growers)) {
      showInfoToast(t("missingFields"));
      return;
    }

    if (filledInvites.length > 0) {
      mutate({
        body: {
          formalGrowers: filledInvites,
        },
      });
    }
  };

  const handleCloseModal = () => {
    setGrowers([{ email: "", phoneNumber: "" }]);
    onClose();
  };

  return (
    <AppDialog
      key={"invite-formal-grower-dialog"}
      isOpen={isOpen}
      size={"xlarge"}
      title={t("title")}
      closeOnBackground={false}
      onOpenChange={(_) => {
        handleCloseModal();
      }}
      content={
        <>
          <AppDialogContent>
            <div className="flex flex-col gap-[28px]">
              <div className="rounded-lg border">
                <table className="w-full">
                  <thead>
                    <tr className="text-secondary-foreground bg-[#F3F6F3] text-xs">
                      <th className="w-1/2 rounded-tl-lg px-4 py-2 text-left">
                        {t("phoneNumber")}
                      </th>
                      <th className="w-1/2 border-l px-4 py-2 text-left">
                        {t("email")}
                      </th>
                      <th className={"rounded-tr-lg"}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {growers.map((grower, i) => (
                      <tr key={i}>
                        <td className="text-left">
                          <div className={"w-full"}>
                            <PhoneInput
                              onChange={(value) =>
                                updateGrower(i, "phoneNumber", value)
                              }
                              defaultCountry={"GH"}
                              international={false}
                              placeholder={t("phoneNumberPlaceholder")}
                              className="h-10 w-full items-center rounded-md  placeholder:text-[#525C4E]"
                              numberInputProps={{
                                className:
                                  "border-none focus-visible:ring-0 focus-visible:ring-offset-0",
                              }}
                              countrySelectProps={{
                                className:
                                  "bg-transparent border-none hover:bg-transparent hover:text-foreground h-10 rounded-s-md",
                              }}
                              key={"GH"} // Force re-render when country changes
                            />
                            {grower.phoneNumber &&
                              !isValidPhoneNumber(grower.phoneNumber) && (
                                <p className="px-3 text-xs text-red-500">
                                  {t("invalidPhoneNumber")}
                                </p>
                              )}

                            {grower.phoneNumber &&
                              phoneNumberAlreadyExists(
                                grower.phoneNumber,
                                growers,
                              ) && (
                                <p className="px-3 text-xs text-red-500">
                                  {t("phoneNumberAlreadyExists")}
                                </p>
                              )}
                          </div>
                        </td>
                        <td className="border-l text-left">
                          <div className={"w-full pl-1"}>
                            <InputComponent
                              value={grower.email}
                              onChange={(e) =>
                                updateGrower(i, "email", e.target.value)
                              }
                              placeholder={"example@completefarmer.com"}
                              className="w-full border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                            />
                            {grower.email && !isValidEmail(grower.email) && (
                              <p className="px-3 text-xs text-red-500">
                                {t("invalidEmail")}
                              </p>
                            )}
                            {grower.email &&
                              emailAlreadyExists(grower.email, growers) && (
                                <p className="px-3 text-xs text-red-500">
                                  {t("emailAlreadyExists")}
                                </p>
                              )}
                          </div>
                        </td>
                        <td
                          className={cn(
                            "text-center",
                            growers.length > 1 && "border-l",
                          )}
                        >
                          {growers.length > 1 && (
                            <Button
                              tabIndex={-1}
                              onClick={() => removeGrower(i)}
                              size={"sm"}
                              className="font-semibold text-[#161D14]"
                              variant={"ghost"}
                            >
                              <X className="size-6" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div>
                <Button
                  onClick={addNew}
                  size={"sm"}
                  className="font-semibold text-[#1A5514]"
                  variant={"secondary"}
                >
                  <Plus className="size-4" />
                  {t("addNew")}
                </Button>
              </div>
            </div>
          </AppDialogContent>
          <AppDialogFooter className="flex justify-end">
            <PrimaryButton
              onClick={handleSendInvite}
              disabled={
                filledInvites.length === 0 ||
                hasInvalidEmails(growers) ||
                hasDuplicateEmails(growers) ||
                hasInvalidPhoneNumbers(growers) ||
                hasDuplicatePhoneNumbers(growers)
              }
              isLoading={isPending}
              buttonContent={t("inviteButton")}
              className="rounded-xl px-8 text-white"
            />
          </AppDialogFooter>
        </>
      }
    />
  );
};

export default InviteFormalGrowerDialog;
