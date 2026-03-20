"use client";

import {
  Button,
  cn,
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
import { IconPlus, IconTrashX, IconX } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { type Country, parsePhoneNumber } from "react-phone-number-input/min";

import PrimaryButton from "@/components/buttons/primary-button";
import AppDialog from "@/components/modals/app-dialog";
import AppDialogContent from "@/components/modals/app-dialog-content";
import { useApiClient } from "@/lib/api";
import type { AgentInvitationData } from "@/lib/schemas/invitation-schema";
import { AgentInvitationSchema } from "@/lib/schemas/invitation-schema";
import { useModal } from "@/lib/stores/use-modal";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toast";

interface AgentInvitationProps {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

const InviteAgentsDialog = () => {
  const { isOpen, type, onClose } = useModal();
  const t = useTranslations("customerManagement.agents.inviteAgents");
  const tt = useTranslations("common.errors");
  const isModalOpen = isOpen && type === "InviteAgent";
  const [currentCountry, setCurrentCountry] = useState<Country>("GH");
  const api = useApiClient();
  const queryClient = useQueryClient();
  const [agents, setAgents] = useState<AgentInvitationProps[]>([]);

  const form = useForm<AgentInvitationData>({
    resolver: zodResolver(AgentInvitationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
    },
  });
  const { handleSubmit, control, formState, reset, setValue } = form;

  const { mutate, isPending } = api.useMutation(
    "post",
    "/customer-management/agents/invite",
    {
      onSuccess: async (data: any) => {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: ["get", "/customer-management/agents"],
          }),
          queryClient.invalidateQueries({
            queryKey: ["get", "/customer-management/agents/metrics"],
          }),
        ]);
        showSuccessToast(data?.message ?? t("successMessage"));

        onClose();
      },
      onError: (error: any) => {
        showErrorToast(error?.message ?? tt("unknown_error"));
      },
    },
  );

  if (!isModalOpen) return null;

  const handleFormSubmit = (data: AgentInvitationData) => {
    mutate({
      body: {
        agents: [...agents, data],
      },
    });
  };

  const handleCloseModal = () => {
    onClose();
  };

  const handleAddNew = (data: AgentInvitationData) => {
    const existEmail = agents.some(
      (agent) =>
        agent.email.toLowerCase().trim() === data.email.toLowerCase().trim(),
    );
    const existPhoneNumber = agents.some(
      (agent) => agent.phoneNumber.trim() === data.phoneNumber.trim(),
    );

    if (existEmail) {
      showErrorToast("Agent with this email already exists");
      return;
    }

    if (existPhoneNumber) {
      showErrorToast("Agent with this phone number already exists");
      return;
    }

    setAgents((prevState) => [
      ...prevState,
      {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
      },
    ]);
    reset();
  };

  const handleDeleteAgent = (index: number) => {
    setAgents((prevState) => prevState.filter((_, i) => i !== index));
  };

  const handleRemoveAgent = () => {
    const lastAgent = agents[agents.length - 1];
    if (lastAgent) {
      setAgents((prevState) =>
        prevState.filter((_, i) => i !== agents.length - 1),
      );
      setValue("firstName", lastAgent.firstName, { shouldValidate: true });
      setValue("lastName", lastAgent.lastName, { shouldValidate: true });
      setValue("email", lastAgent.email, { shouldValidate: true });
      setValue("phoneNumber", lastAgent.phoneNumber, { shouldValidate: true });
    }
  };

  return (
    <AppDialog
      key={"invite-agents-dialog"}
      isOpen={isOpen}
      size={"large"}
      title={t("title", {
        group: "agents",
      })}
      closeOnBackground={false}
      onOpenChange={(_) => {
        handleCloseModal();
      }}
      contentClassName={"pt-0 pb-6"}
      content={
        <>
          <AppDialogContent className={"flex flex-col gap-4"}>
            {agents.length > 0 && (
              <div className={"flex flex-col gap-4 rounded-xl border p-4"}>
                {agents.map((agent, index) => (
                  <React.Fragment key={index}>
                    <div className={"flex items-center gap-4"}>
                      <div className={"flex-1"}>
                        <p className={"text-sm"}>
                          {agent.firstName} {agent.lastName}
                        </p>
                        <p className={"text-secondary-foreground text-xs"}>
                          {agent.email} • {agent.phoneNumber}
                        </p>
                      </div>
                      <div className={"flex items-center gap-4"}>
                        <Button
                          onClick={() => handleDeleteAgent(index)}
                          className={
                            "bg-error-container-light hover:bg-error-container-light text-error-container h-9 w-9"
                          }
                        >
                          <IconTrashX />
                        </Button>
                      </div>
                    </div>

                    {index !== agents.length - 1 && <hr />}
                  </React.Fragment>
                ))}
              </div>
            )}

            <div
              className={cn(
                "relative",
                agents.length > 0 && "rounded-xl border p-4",
              )}
            >
              {agents.length > 0 && (
                <div className={"absolute right-0 top-0 flex justify-end"}>
                  <Button
                    onClick={handleRemoveAgent}
                    variant={"ghost"}
                    className={
                      "hover:text-foreground h-9 w-9 hover:bg-transparent"
                    }
                  >
                    <IconX />
                  </Button>
                </div>
              )}
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
                        // Update country when phone number changes
                        if (value) {
                          field.onChange(value);
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
                              className="bg-primary-light h-10 w-full items-center rounded-md placeholder:text-[#525C4E]"
                              countrySelectProps={{
                                className: "bg-primary-light h-10 rounded-s-md",
                              }}
                              key={currentCountry} // Force re-render when country changes
                            />
                          </FormControl>
                          <FormMessage className={"text-xs font-normal"} />
                        </FormItem>
                      );
                    }}
                  />
                </div>
              </Form>
            </div>

            <div className={"flex items-center justify-between gap-4"}>
              <Button
                onClick={() => {
                  void handleSubmit(handleAddNew)();
                }}
                variant={"secondary"}
                className={"text-success-secondary h-8 w-fit px-2 font-bold"}
                disabled={!formState.isValid}
              >
                <IconPlus className="s-4" />
                Add new
              </Button>
            </div>

            <div>
              <hr className={"-mx-10 mb-4"} />
              <PrimaryButton
                onClick={() => {
                  void handleSubmit(handleFormSubmit)();
                }}
                disabled={!formState.isValid}
                isLoading={isPending}
                buttonContent={t("inviteButton", {
                  group: "agents",
                })}
                className="w-full rounded-xl px-8 text-white"
              />
            </div>
          </AppDialogContent>
        </>
      }
    />
  );
};

export default InviteAgentsDialog;
