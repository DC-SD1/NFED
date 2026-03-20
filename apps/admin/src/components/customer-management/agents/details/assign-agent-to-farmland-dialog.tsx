"use client";

import { Form } from "@cf/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useTranslations } from "next-intl";
import React from "react";
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

const AssignAgentToFarmlandDialog = () => {
  const { isOpen, type, onOpen, onClose } = useModal();
  const t = useTranslations("customerManagement.agents.details.assignFarmland");
  const isModalOpen = isOpen && type === "AssignAgentToFarmland";

  const form = useForm<AssignFarmlandData>({
    resolver: zodResolver(AssignFarmlandSchema),
    defaultValues: {
      farmlandId: "",
    },
  });
  const { handleSubmit, control, formState } = form;

  if (!isModalOpen) return null;

  const handleFormSubmit = (data: AssignFarmlandData) => {
    onOpen("ConfirmFarmLandAssignment");
    console.log(data);
  };

  const handleCloseModal = () => {
    onClose();
  };

  return (
    <AppDialog
      key={"assign-agent-to-farmland-dialog"}
      isOpen={isOpen}
      size={"large"}
      title={t("title")}
      closeOnBackground={false}
      onOpenChange={(_) => {
        handleCloseModal();
      }}
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
              </div>
            </Form>

            <PrimaryButton
              onClick={() => {
                void handleSubmit(handleFormSubmit)();
              }}
              disabled={!formState.isValid}
              buttonContent={t("buttonText")}
              className="rounded-xl px-8 text-white"
            />
          </AppDialogContent>
        </>
      }
    />
  );
};

export default AssignAgentToFarmlandDialog;
