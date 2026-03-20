"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import DestructiveConfirmationDialog from "@/components/modals/destructive-confirmation-dialog";
import { useApiClient } from "@/lib/api";
import useTableStore from "@/lib/stores/table-store/table-store";
import { useModal } from "@/lib/stores/use-modal";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toast";

export default function DeactivateUserConfirmationDialog() {
  const { isOpen, type, data, onClose } = useModal();
  const clearRows = useTableStore.use.clearRows();
  const t = useTranslations("userManagement.deactivateUser");
  const isModalOpen = isOpen && type === "DestructiveConfirmation";
  const api = useApiClient();
  const queryClient = useQueryClient();

  const { users, isBulk } = data;
  const activeUsers = users ?? [];

  const { mutate, isPending } = api.useMutation(
    "patch",
    "/admin/dashboard/users/deactivate",
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
        showSuccessToast(
          isBulk
            ? `${activeUsers.length} ${activeUsers.length === 1 ? "user" : "users"} are deactivated.`
            : "User is deactivated.",
        );
        clearRows();
        onClose();
      },
      onError: (error: any) => {
        showErrorToast(error?.message ?? "");
        onClose();
      },
    },
  );

  if (!isModalOpen) return null;

  const handleDeactivate = () => {
    mutate({
      body: {
        userIds: activeUsers.map((user) => user.id),
      },
    });
  };

  return (
    <DestructiveConfirmationDialog
      isOpen={isModalOpen}
      title={
        isBulk ? t("bulkTitle", { count: activeUsers.length }) : t("title")
      }
      message={
        isBulk
          ? t("description")
          : t("singleDeactivateDescription", {
              name:
                activeUsers.length > 0 ? (activeUsers as any)[0].firstName : "",
            })
      }
      confirmDialog={handleDeactivate}
      closeDialog={onClose}
      confirmText={isBulk ? t("bulkDeactivateButton") : t("deactivateButton")}
      cancelText={t("cancelButton")}
      confirmButtonLoading={isPending}
    />
  );
}
