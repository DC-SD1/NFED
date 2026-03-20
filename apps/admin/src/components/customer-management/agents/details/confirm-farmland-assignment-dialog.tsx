"use client";

import { useTranslations } from "next-intl";
import React from "react";

import ConfirmationDialog from "@/components/modals/confirmation-dialog";
import { useModal } from "@/lib/stores/use-modal";
import { showSuccessToast } from "@/lib/utils/toast";

const ConfirmFarmlandAssignmentDialog = () => {
  const { isOpen, type, data, onClose } = useModal();
  const t = useTranslations("customerManagement.agents.details.assignFarmland");
  const isModalOpen = isOpen && type === "ConfirmFarmLandAssignment";
  const { isReassign } = data;
  if (!isModalOpen) return null;

  const handleConfirm = () => {
    showSuccessToast(
      isReassign
        ? t("reassignSuccessMessage", {
            farmland: "Farmland 1",
          })
        : t("successMessage"),
    );
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <ConfirmationDialog
      key={"confirm-farmland-assignment-dialog"}
      dialogContentClassName={"top-1/4"}
      isOpen={isOpen}
      title={
        isReassign
          ? t("confirmationDialog.reassignTitle")
          : t("confirmationDialog.title")
      }
      message={
        isReassign
          ? t("confirmationDialog.reassignMessage", {
              agentName: "James Boateng",
              farmlandName: "Farmland 1",
            })
          : t("confirmationDialog.message", {
              agentName: "James Boateng",
              farmlandName: "Farmland 1",
            })
      }
      cancelText={t("confirmationDialog.cancel")}
      confirmText={isReassign ? t("reassign") : t("confirmationDialog.assign")}
      closeDialog={handleCancel}
      confirmDialog={handleConfirm}
    />
  );
};

export default ConfirmFarmlandAssignmentDialog;
