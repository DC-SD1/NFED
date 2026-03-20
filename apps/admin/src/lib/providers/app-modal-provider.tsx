"use client";

import React from "react";

import ExportListDialog from "@/components/common/export-list-dialog";
import ImageViewDialog from "@/components/common/image-view-dialog";
import AssignAgentToFarmlandDialog from "@/components/customer-management/agents/details/assign-agent-to-farmland-dialog";
import ConfirmFarmlandAssignmentDialog from "@/components/customer-management/agents/details/confirm-farmland-assignment-dialog";
import ReassignAgentToFarmlandDialog from "@/components/customer-management/agents/details/reassign-agent-to-farmland-dialog";
import InviteAgentsDialog from "@/components/customer-management/agents/invite-agents-dialog";
import InviteBuyersDialog from "@/components/customer-management/buyer/invite-buyers-dialog";
import GrowerSuspensionReasonModal from "@/components/customer-management/formal-grower/details/grower-suspension-reason-modal";
import InviteFormalGrowerDialog from "@/components/customer-management/formal-grower/invite-formal-grower-dialog";
import RequestToSuspendGrowerDialog from "@/components/customer-management/formal-grower/request-to-suspend-grower-dialog";
import EditFulfilmentCenter from "@/components/fulfilment-centers/edit-fulfilment-center";
import SuccessDialog from "@/components/modals/success-dialog";
import ActivityHistorySheetModal from "@/components/user-management/activity-history-sheet-modal";
import DeactivateUserConfirmationDialog from "@/components/user-management/deactivate-user-confirmation-dialog";
import EditAccountDialog from "@/components/user-management/edit-account-dialog";
import EditUserRoleDialog from "@/components/user-management/edit-user-role-dialog";
import InviteUserDialog from "@/components/user-management/invite-user-dialog";
import UserDetailsSheetModal from "@/components/user-management/user-details-sheet-modal";
import UserProfileSheetModal from "@/components/user-management/user-profile-sheet-modal";
import PinConfirmationDialog from "@/components/wallets/pin-confirmation-dialog";
import SelectFulfilmentCenterModal from "@/components/wallets/select-fulfilment-center-modal";
import SendMoneyDialog from "@/components/wallets/send-money-dialog";
import { useModal } from "@/lib/stores/use-modal";

export const AppModalProvider = () => {
  const { isOpen, type } = useModal();
  // This check always make sure the modals
  // doesn't live in the browser even if it is closed
  if (!isOpen) return null;
  return (
    <>
      <DeactivateUserConfirmationDialog />
      <ImageViewDialog />
      {type === "Success" && <SuccessDialog />}
      <ExportListDialog />
      {type === "InviteUser" && <InviteUserDialog />}
      <UserDetailsSheetModal />
      {type === "EditUserRole" && <EditUserRoleDialog />}
      {type === "ActivityHistory" && <ActivityHistorySheetModal />}
      {type === "UserProfile" && <UserProfileSheetModal />}
      {type === "EditAccount" && <EditAccountDialog />}
      {type === "InviteFormalGrower" && <InviteFormalGrowerDialog />}
      {type === "RequestToSuspendGrower" && <RequestToSuspendGrowerDialog />}
      {type === "GrowerSuspensionReason" && <GrowerSuspensionReasonModal />}
      {type === "InviteAgent" && <InviteAgentsDialog />}
      {type === "InviteBuyer" && <InviteBuyersDialog />}
      {type === "AssignAgentToFarmland" && <AssignAgentToFarmlandDialog />}
      {type === "ReassignAgentToFarmland" && <ReassignAgentToFarmlandDialog />}
      {type === "ConfirmFarmLandAssignment" && (
        <ConfirmFarmlandAssignmentDialog />
      )}
      {type === "EditFulfilmentCenter" && <EditFulfilmentCenter />}
      {type === "EditFulfilmentCenter" && <EditFulfilmentCenter />}
      {type === "SendMoney" && <SendMoneyDialog />}
      {type === "SelectFulfilmentCenter" && <SelectFulfilmentCenterModal />}
      <PinConfirmationDialog />
    </>
  );
};
