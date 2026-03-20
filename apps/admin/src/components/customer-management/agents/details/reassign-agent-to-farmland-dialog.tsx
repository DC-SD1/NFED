"use client";

import { Form } from "@cf/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useTranslations } from "next-intl";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

import PrimaryButton from "@/components/buttons/primary-button";
import { FormSearchableDropdown } from "@/components/input-components/form-searchable-dropdown";
import AppDialog from "@/components/modals/app-dialog";
import AppDialogContent from "@/components/modals/app-dialog-content";
import type { AssignFarmlandData } from "@/lib/schemas/assignment-schema";
import { AssignFarmlandSchema } from "@/lib/schemas/assignment-schema";
import { useModal } from "@/lib/stores/use-modal";
import { ImageAssets } from "@/utils/image-assets";

const FARMLANDS = [
  {
    value: "1",
    label: "Boadu Chilli farms",
    owner: "James Boadu",
  },
  {
    value: "2",
    label: "Green Valley Hydroponics",
    owner: "Mark Rivera",
  },
  {
    value: "3",
    label: "Crystal Clear Aquaponics",
    owner: "Emily Chen",
  },
  {
    value: "4",
    label: "Sunny Meadows Organic Farm",
    owner: "Sarah Thompson",
  },
  {
    value: "5",
    label: "Harvest Moon Farms",
    owner: "David Kim",
  },
];

const ReassignAgentToFarmlandDialog = () => {
  const { isOpen, type, onOpen, onClose } = useModal();
  const t = useTranslations("customerManagement.agents.details.assignFarmland");
  const isModalOpen = isOpen && type === "ReassignAgentToFarmland";
  const [updateMode, setUpdateMode] = useState(false);

  const form = useForm<AssignFarmlandData>({
    resolver: zodResolver(AssignFarmlandSchema),
    defaultValues: {
      farmlandId: "",
    },
  });
  const { handleSubmit, control, formState } = form;

  if (!isModalOpen) return null;

  const handleFormSubmit = (data: AssignFarmlandData) => {
    onOpen("ConfirmFarmLandAssignment", { isReassign: true });
  };

  return (
    <AppDialog
      key={"re-assign-agent-to-farmland-dialog"}
      isOpen={isOpen}
      size={"large"}
      title={t("reassignTitle")}
      closeOnBackground={false}
      onOpenChange={(_) => onClose()}
      content={
        <>
          <AppDialogContent className={"flex flex-col gap-14"}>
            <Form {...form}>
              <div className="space-y-6">
                <div
                  className={"flex w-full flex-col gap-1 rounded-lg border p-4"}
                >
                  <p className={"text-secondary-foreground text-sm"}>
                    {t("selectedAgent")}
                  </p>
                  <p>James Boateng</p>
                </div>

                {updateMode ? (
                  <FormSearchableDropdown
                    label={t("farmland")}
                    control={control}
                    placeholder={t("farmlandPlaceholder")}
                    searchPlaceholder={t("farmlandSearchPlaceholder")}
                    name={"farmlandId"}
                    options={FARMLANDS}
                    renderDropdownItem={(option) => (
                      <div className={"flex items-center gap-4"}>
                        <Image
                          src={ImageAssets.MAP_CONTAINER}
                          alt={"Map"}
                          className={"size-12 rounded-lg object-contain"}
                        />
                        <div className="flex flex-col gap-1">
                          <p>{option.label}</p>
                          <p className="text-secondary-foreground text-sm">
                            {option.owner}
                          </p>
                        </div>
                      </div>
                    )}
                  />
                ) : (
                  <div className={"flex flex-col gap-2"}>
                    <p className={"text-secondary-foreground text-sm"}>
                      {t("selectedFarmland")}
                    </p>

                    <div className={"flex gap-4 rounded-xl border p-4"}>
                      <Image
                        src={ImageAssets.MAP_CONTAINER}
                        alt={"Map"}
                        className={"size-12 rounded-lg object-contain"}
                      />
                      <div className={"flex w-full flex-col gap-3"}>
                        <h4>Boadu Chilli farms</h4>
                        <div className={"flex w-full justify-between gap-3"}>
                          <div>
                            <p className={"text-secondary-foreground text-xs"}>
                              {t("grower")}
                            </p>
                            <p className={"text-sm"}>James Boadu</p>
                          </div>
                          <div>
                            <p className={"text-secondary-foreground text-xs"}>
                              {t("assignedAgent")}
                            </p>
                            <p className={"text-sm"}>Sarah Kinsey</p>
                          </div>
                          <div>
                            <p className={"text-secondary-foreground text-xs"}>
                              {t("location")}
                            </p>
                            <p className={"text-sm"}>Asutware</p>
                          </div>
                          <div>
                            <p className={"text-secondary-foreground text-xs"}>
                              {t("size")}
                            </p>
                            <p className={"text-sm"}>23 ac</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Form>

            {updateMode ? (
              <div className={"flex justify-between gap-6 sm:gap-10"}>
                <PrimaryButton
                  variant={"secondary"}
                  onClick={() => setUpdateMode(false)}
                  buttonContent={t("back")}
                  className="text-success-secondary w-full rounded-xl px-8"
                />
                <PrimaryButton
                  onClick={() => {
                    void handleSubmit(handleFormSubmit)();
                  }}
                  disabled={!formState.isValid}
                  buttonContent={t("reassign")}
                  className="w-full rounded-xl px-8 text-white"
                />
              </div>
            ) : (
              <PrimaryButton
                onClick={() => setUpdateMode(true)}
                buttonContent={"Update assignment"}
                className="rounded-xl px-8 text-white"
              />
            )}
          </AppDialogContent>
        </>
      }
    />
  );
};

export default ReassignAgentToFarmlandDialog;
