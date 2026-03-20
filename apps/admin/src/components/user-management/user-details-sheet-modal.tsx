"use client";

import { Alert, Avatar, cn } from "@cf/ui";
import { React } from "@cf/ui/icons";
import {
  IconCircleCheck,
  IconEdit,
  IconHistoryToggle,
  IconInfoCircleFilled,
  IconLoader2,
  IconMailForward,
  IconTrashX,
} from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import AppSheetModal from "@/components/sheets/app-sheet-modal";
import { useApiClient } from "@/lib/api";
import { useModal } from "@/lib/stores/use-modal";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toast";
import { STATUS_COLORS, STATUSES } from "@/utils/constants/status-constants";
import { getUserInitials } from "@/utils/helpers/common-helpers";

export default function UserDetailsSheetModal() {
  const { isOpen, onClose, type, data, onOpen } = useModal();
  const t = useTranslations("userManagement");
  const isModalOpen = isOpen && type === "UserDetails";
  const api = useApiClient();
  const queryClient = useQueryClient();

  const user = data?.user;

  const disableEditRole = user?.status?.toLowerCase() !== STATUSES.active;

  const { mutate: resendInvite, isPending: isResendingInvite } =
    api.useMutation("post", "/admin/dashboard/users/resend-invite", {
      onSuccess: () => {
        showSuccessToast("Invitation re-sent successfully");
      },
      onError: (error: any) => {
        const errorMessages = error?.errors
          ?.map((err: any) => err.message)
          .join(", ");
        showErrorToast(errorMessages ?? "");
      },
    });

  const handleResendInvite = () => {
    resendInvite({
      body: {
        invitationIds: [user?.id ?? ""],
      },
    });
  };

  const { mutate: reactivateUser, isPending: isReactivating } = api.useMutation(
    "patch",
    "/admin/dashboard/users/reactivate",
    {
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: ["get", "/admin/dashboard/users"],
          }),
          queryClient.invalidateQueries({
            queryKey: ["get", "/admin/metrics"],
          }),
        ]);
        showSuccessToast("User reactivated.");
        onClose();
      },
      onError: (error: any) => {
        const errorMessages = error?.errors
          ?.map((err: any) => err.message)
          .join(", ");
        showErrorToast(errorMessages ?? "");
      },
    },
  );

  const handleReactivateUser = () => {
    reactivateUser({
      body: {
        userId: user?.id,
      },
    });
  };

  return (
    <AppSheetModal
      title={t("accountDetail.title")}
      open={isModalOpen}
      onClose={onClose}
    >
      <div className="flex flex-col gap-16">
        <div>
          {user?.status?.toLowerCase() === STATUSES.deactivated && (
            <Alert
              className={
                "mb-4 border border-[#FFDAD6] bg-[#FFDAD6] text-sm text-[#8F0004]"
              }
              variant={"destructive"}
            >
              <IconInfoCircleFilled className={"size-5 text-[#8F0004]"} />
              Account has been deactivated
            </Alert>
          )}
          <div className="flex items-center gap-4">
            <Avatar
              className={
                "flex items-center justify-center bg-[#235C4B] p-8 text-xl font-bold text-white"
              }
            >
              {getUserInitials(user?.fullName ?? "")}
            </Avatar>
            <div className="flex flex-col gap-1">
              <p>{user?.fullName ?? ""}</p>
              <p className="text-secondary-foreground text-sm">
                {user?.email ?? ""}
              </p>
              <p
                className={cn(
                  "text-sm",
                  STATUS_COLORS[user?.status?.toLowerCase() ?? "pending"],
                )}
              >
                {user?.status ?? ""}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            disabled={disableEditRole}
            onClick={() => {
              onOpen("EditUserRole", { user });
            }}
            className={cn(
              "hover:bg-btn-hover text-foreground flex flex-1 flex-col items-center gap-2 rounded-lg border bg-white p-3 text-sm shadow-[0px_1px_6px_0px_rgba(22,29,20,0.16)]",
              disableEditRole && "cursor-not-allowed opacity-40",
            )}
          >
            <IconEdit className={"size-5 text-[#44C63A]"} />
            {t("accountDetail.editRole")}
          </button>
          {user?.status?.toLowerCase() === STATUSES.active && (
            <>
              <button
                className={
                  "hover:bg-btn-hover text-foreground flex flex-1 flex-col items-center gap-2 rounded-lg border bg-white p-3 text-sm shadow-[0px_1px_6px_0px_rgba(22,29,20,0.16)]"
                }
              >
                <IconHistoryToggle className={"size-5 text-[#44C63A]"} />
                {t("accountDetail.activityHistory")}
              </button>
              <button
                className={
                  "hover:bg-btn-hover text-foreground flex flex-1 flex-col items-center gap-2 rounded-lg border bg-white p-3 text-sm shadow-[0px_1px_6px_0px_rgba(22,29,20,0.16)]"
                }
                onClick={() => {
                  onOpen("DestructiveConfirmation", {
                    users: [user],
                    isBulk: false,
                  });
                }}
              >
                <IconTrashX className={"size-5 text-[#BA1A1A]"} />
                {t("accountDetail.deactivate")}
              </button>
            </>
          )}
          {user?.status?.toLowerCase() === STATUSES.pending && (
            <button
              disabled={isResendingInvite}
              onClick={handleResendInvite}
              className={cn(
                "hover:bg-btn-hover text-foreground flex flex-1 flex-col items-center gap-2 rounded-lg border bg-white p-3 text-sm shadow-[0px_1px_6px_0px_rgba(22,29,20,0.16)]",
                isResendingInvite && "cursor-not-allowed opacity-40",
              )}
            >
              {isResendingInvite ? (
                <IconLoader2 className={"size-5 animate-spin text-[#44C63A]"} />
              ) : (
                <IconMailForward className={"size-5 text-[#44C63A]"} />
              )}
              {t("accountDetail.resendInvite")}
            </button>
          )}

          {user?.status?.toLowerCase() === STATUSES.deactivated && (
            <button
              disabled={isReactivating}
              onClick={handleReactivateUser}
              className={cn(
                "hover:bg-btn-hover text-foreground flex flex-1 flex-col items-center gap-2 rounded-lg border bg-white p-3 text-sm shadow-[0px_1px_6px_0px_rgba(22,29,20,0.16)]",
                isReactivating && "cursor-not-allowed opacity-40",
              )}
            >
              {isReactivating ? (
                <IconLoader2 className={"size-5 animate-spin text-[#44C63A]"} />
              ) : (
                <IconCircleCheck className={"size-5 text-[#44C63A]"} />
              )}
              {t("accountDetail.reactivate")}
            </button>
          )}
        </div>

        <div className={"rounded-xl border p-4"}>
          <div>
            <p className={"text-secondary-foreground text-sm font-bold"}>
              {t("accountDetail.department")}
            </p>
            <p>{user?.department ?? ""}</p>
          </div>
          <hr className={"bg-border my-4"} />
          <div>
            <p className={"text-secondary-foreground text-sm font-bold"}>
              {t("accountDetail.assignedRole")}
            </p>
            <p>{user?.name ?? ""}</p>
          </div>
          <hr className={"bg-border my-4"} />
          <div>
            <p className={"text-secondary-foreground text-sm font-bold"}>
              {t("accountDetail.phoneNumber")}
            </p>
            <p>{"Not provided"}</p>
          </div>
        </div>
      </div>
    </AppSheetModal>
  );
}
