"use client";

import { Form, FormTextareaInput } from "@cf/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import React from "react";
import { useForm } from "react-hook-form";

import PrimaryButton from "@/components/buttons/primary-button";
import { FileUpload } from "@/components/file-upload/file-upload";
import AppDialog from "@/components/modals/app-dialog";
import AppDialogContent from "@/components/modals/app-dialog-content";
import AppDialogFooter from "@/components/modals/app-dialog-footer";
import type { SuspendFormalGrowerData } from "@/lib/schemas/request-to-suspend-schema";
import { SuspendFormalGrowerSchema } from "@/lib/schemas/request-to-suspend-schema";
import { useModal } from "@/lib/stores/use-modal";

const RequestToSuspendGrowerDialog = () => {
  const { isOpen, type, data, onClose, onOpen } = useModal();
  const t = useTranslations(
    "customerManagement.formalGrower.requestToSuspendGrower",
  );
  const isModalOpen = isOpen && type === "RequestToSuspendGrower";
  const grower = data?.formalGrower;

  const form = useForm<SuspendFormalGrowerData>({
    resolver: zodResolver(SuspendFormalGrowerSchema),
    defaultValues: {
      reason: "",
    },
  });

  const { handleSubmit, watch, formState } = form;

  const SELECTED_REASON = watch("reason");

  const handleCloseDialog = () => {
    onClose();
  };

  const handleFormSubmit = (data: SuspendFormalGrowerData) => {
    console.log(data);
    onOpen("Success", {
      title: t("successModal.title"),
      message: t("successModal.description", {
        growerName: `${grower?.growerName ?? ""}`,
      }),
      primaryButton: {
        label: t("successModal.done"),
        onClick: () => {
          onClose();
        },
      },
    });
  };

  if (!isModalOpen) return null;

  return (
    <AppDialog
      key={"request-to-suspend-grower"}
      isOpen={isOpen}
      size={"medium"}
      title={t("title")}
      onOpenChange={(_) => {
        handleCloseDialog();
      }}
      content={
        <>
          <AppDialogContent>
            <div className={"flex flex-col gap-6"}>
              <div className={"flex flex-col gap-2"}>
                <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
                  <p>{t("grower")}</p>
                  <p>{grower?.growerName ?? ""}</p>
                </div>
                <div className="flex flex-col gap-2 rounded-lg border p-4">
                  <p className={"text-secondary-foreground text-sm font-bold"}>
                    {t("assignedFulfillmentCenters")}
                  </p>
                  <p className="text-sm">Juapong fulfilment center</p>
                  <p className="text-sm">Mankesim fulfilment center</p>
                </div>
              </div>

              <div className={"flex flex-col gap-2"}>
                <p className={"text-sm font-bold"}>{t("proofOfViolation")}</p>
                <FileUpload<any>
                  maxFiles={1}
                  allowedTypes={["pdf", "jpeg", "jpg", "png"]}
                  iconColor="text-primary"
                  dropzoneProps={{
                    title: t("fileTitle"),
                    description: t("fileDescription"),
                  }}
                />
              </div>

              <div className={"flex flex-col gap-2"}>
                <div className="flex items-center justify-between">
                  <p className={"text-sm font-bold"}>{t("suspensionReason")}</p>
                  <p className="text-secondary-foreground text-sm">
                    {SELECTED_REASON?.length ?? 0}/240
                  </p>
                </div>
                <Form {...form}>
                  <FormTextareaInput
                    rows={4}
                    maxLength={240}
                    name="reason"
                    placeholder={t("reasonPlaceholder")}
                    className={"border-input-border bg-input"}
                  />
                </Form>
              </div>
            </div>
          </AppDialogContent>

          <AppDialogFooter
            className="w-full"
            isBordered={false}
            dividerClassName={"mb-3 mt-6"}
          >
            <PrimaryButton
              disabled={!formState.isValid}
              buttonContent={t("submit")}
              onClick={() => {
                void handleSubmit(handleFormSubmit)();
              }}
              className="w-full rounded-xl px-10"
            />
          </AppDialogFooter>
        </>
      }
    />
  );
};

export default RequestToSuspendGrowerDialog;
