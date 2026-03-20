"use client";

import { Badge, Button } from "@cf/ui";
import { IconMailForward, IconUserPlus } from "@tabler/icons-react";
import { RefreshCw, Search, X } from "lucide-react";
import { useTranslations } from "next-intl";

import PrimaryButton from "@/components/buttons/primary-button";
import DropdownComponent from "@/components/input-components/dropdown-component";
import InputComponent from "@/components/input-components/input-component";
import { useApiClient } from "@/lib/api";
import useTableStore from "@/lib/stores/table-store/table-store";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toast";
import { STATUSES } from "@/utils/constants/status-constants";

const STATUS_OPTIONS = [
  {
    label: "All statuses",
    value: "all",
  },
  {
    label: "Active",
    value: "active",
  },
  {
    label: "Pending",
    value: "pending",
  },
  {
    label: "Suspended",
    value: "suspended",
  },
  {
    label: "Pending suspension",
    value: "pending suspension",
  },
  {
    label: "Deactivated",
    value: "deactivated",
  },
];

interface Props {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedStatus: string;
  setSelectedStatus: (value: React.SetStateAction<string>) => void;
}

export default function FormalGrowerTableToolbar({
  searchTerm,
  setSearchTerm,
  selectedStatus,
  setSelectedStatus,
}: Props) {
  const { rows, clearRows } = useTableStore();
  const t = useTranslations("customerManagement.formalGrower.filters");
  const api = useApiClient();

  const handleResetToolbar = () => {
    clearRows();
  };

  const handleRemoveFilter = () => {
    setSelectedStatus("all");
  };

  const pendingGrowerRows = rows.filter(
    (row: any) => row.data.status.toLowerCase() === STATUSES.pending,
  );

  const { mutate: resendInvites, isPending } = api.useMutation(
    "post",
    "/customer-management/formal-growers/resend-invite",
    {
      onSuccess: async () => {
        showSuccessToast(
          `Invite resent to ${pendingGrowerRows.length} ${pendingGrowerRows.length === 1 ? "user" : "users"} successfully`,
        );
        handleResetToolbar();
      },
      onError: (error: any) => {
        const errorMessages = error?.errors
          ?.map((err: any) => err.message)
          .join(", ");
        showErrorToast(errorMessages ?? "");
      },
    },
  );

  const handleBulkResend = () => {
    resendInvites({
      body: {
        invitationIds: pendingGrowerRows.map((row: any) => row.data.id),
      },
    });
  };

  return (
    <>
      {rows.length === 0 ? (
        <>
          <div>
            <InputComponent
              key={"searchTerm"}
              type="search"
              onChange={(e) => setSearchTerm(e.target.value)}
              value={searchTerm}
              placeholder={t("searchPlaceholder")}
              className={"min-w-[22rem] rounded-full"}
              left={<Search className={"size-4"} />}
            />
          </div>
          <div>
            {selectedStatus === "all" ? (
              <DropdownComponent
                className={"rounded-full"}
                defaultValue={selectedStatus}
                options={STATUS_OPTIONS}
                placeholder={t("selectStatus")}
                contentClassName={"min-w-48"}
                onValueChange={(value) => {
                  setSelectedStatus(value);
                }}
              />
            ) : (
              <Badge className="bg-secondary text-secondary-foreground hover:bg-secondary/80 flex h-10 items-center gap-2 px-3 font-normal">
                <span className="capitalize">{selectedStatus}</span>
                <button
                  onClick={handleRemoveFilter}
                  className="flex size-4 cursor-pointer items-center justify-center rounded-full bg-[#161D14] p-1"
                >
                  <X className="size-3 text-white" />
                </button>
              </Badge>
            )}
          </div>
        </>
      ) : (
        <div className="flex w-full items-center justify-between gap-4">
          <div className={"flex items-center gap-2"}>
            {selectedStatus.toLowerCase() === STATUSES.pending && (
              <PrimaryButton
                isLoading={isPending}
                onClick={handleBulkResend}
                variant={"secondary"}
                size="sm"
                className={"text-primary text-sm font-semibold"}
                buttonContent={
                  <>
                    <IconMailForward className={"size-4"} />
                    {t("resendInvite")}
                  </>
                }
              />
            )}
            {selectedStatus.toLowerCase() === STATUSES.deactivated && (
              <PrimaryButton
                variant={"secondary"}
                size="sm"
                className={"text-primary text-sm font-semibold"}
                buttonContent={
                  <>
                    <IconUserPlus className={"size-4"} />
                    {t("requestToReactivate")}
                  </>
                }
              />
            )}
          </div>
          <Button
            onClick={handleResetToolbar}
            variant={"secondary"}
            size="sm"
            className={"text-sm font-semibold text-[#1A5514]"}
          >
            <RefreshCw className={"size-4"} />
            {t("resetToolbar")}
          </Button>
        </div>
      )}
    </>
  );
}
