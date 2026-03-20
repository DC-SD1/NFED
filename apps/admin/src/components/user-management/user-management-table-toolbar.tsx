"use client";

import { Badge, Button } from "@cf/ui";
import { IconMailForward } from "@tabler/icons-react";
import { CircleOff, RefreshCw, Search, X } from "lucide-react";
import { useTranslations } from "next-intl";

import PrimaryButton from "@/components/buttons/primary-button";
import DropdownComponent from "@/components/input-components/dropdown-component";
import InputComponent from "@/components/input-components/input-component";
import { SearchableDropdown } from "@/components/input-components/searchable-dropdown";
import { useApiClient } from "@/lib/api";
import useTableStore from "@/lib/stores/table-store/table-store";
import { useModal } from "@/lib/stores/use-modal";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toast";
import type { OptionProps } from "@/types/common.types";
import type { User } from "@/types/user-management.types";
import { STATUSES } from "@/utils/constants/status-constants";
import { findOption } from "@/utils/helpers/common-helpers";

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
    label: "Deactivated",
    value: "deactivated",
  },
  {
    label: "Pending",
    value: "pending",
  },
];

interface Option {
  label: string;
  value: string;
}

interface Props {
  departments: Option[];
  roles: OptionProps[];
  isLoadingDepartments: boolean;
  isLoadingRoles: boolean;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedFilters: {
    department: string;
    role: string;
    status: string;
  };
  setSelectedFilters: (
    value: React.SetStateAction<{
      department: string;
      role: string;
      status: string;
    }>,
  ) => void;
}

export default function UserManagementTableToolbar({
  departments,
  roles,
  isLoadingDepartments,
  isLoadingRoles,
  searchTerm,
  setSearchTerm,
  selectedFilters,
  setSelectedFilters,
}: Props) {
  const { onOpen } = useModal();
  const { rows, clearRows } = useTableStore();
  const t = useTranslations("userManagement");
  const api = useApiClient();

  const handleDeactivateUsers = () => {
    onOpen("DestructiveConfirmation", {
      isBulk: true,
      users: rows.map((row: any) => row.data as User),
    });
  };

  const handleResetToolbar = () => {
    clearRows();
  };

  const handleRemoveFilter = (filter: "department" | "role" | "status") => {
    setSelectedFilters((prev) => ({
      ...prev,
      [filter]: "all",
    }));
  };

  const pendingUserRows = rows.filter(
    (row: any) => row.data.status.toLowerCase() === STATUSES.pending,
  );

  const { mutate: resendInvites, isPending } = api.useMutation(
    "post",
    "/admin/dashboard/users/resend-invite",
    {
      onSuccess: async () => {
        showSuccessToast(
          `Invite resent to ${pendingUserRows.length} ${pendingUserRows.length === 1 ? "user" : "users"} successfully`,
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
        invitationIds: pendingUserRows.map((row: any) => row.data.id),
      },
    });
  };

  return (
    <>
      {rows.length === 0 ? (
        <>
          <div>
            <InputComponent
              type="search"
              onChange={(e) => setSearchTerm(e.target.value)}
              value={searchTerm}
              placeholder={"Search by name or email"}
              className={"min-w-[22rem] rounded-full"}
              left={<Search className={"size-4"} />}
            />
          </div>
          <div>
            {selectedFilters.department === "all" ? (
              <SearchableDropdown
                className={"rounded-full"}
                searchOuterClassName={"rounded-full"}
                defaultValue={selectedFilters.department}
                placeholder={
                  isLoadingDepartments ? "Loading..." : "Search departments"
                }
                options={departments}
                contentClassName={"min-w-64"}
                onValueChange={(option) => {
                  setSelectedFilters((prev) => ({
                    ...prev,
                    department: option.value,
                  }));
                }}
              />
            ) : (
              <Badge className="bg-secondary text-secondary-foreground hover:bg-secondary/80 flex h-10 items-center gap-2 px-3 font-normal">
                <span className="capitalize">{selectedFilters.department}</span>
                <button
                  onClick={() => {
                    handleRemoveFilter("department");
                  }}
                  className="flex size-4 cursor-pointer items-center justify-center rounded-full bg-[#161D14] p-1"
                >
                  <X className="size-3 text-white" />
                </button>
              </Badge>
            )}
          </div>
          <div>
            {selectedFilters.role === "all" ? (
              <SearchableDropdown
                className={"rounded-full"}
                searchOuterClassName={"rounded-full"}
                defaultValue={selectedFilters.role}
                placeholder={isLoadingRoles ? "Loading" : "Search roles"}
                options={roles}
                contentClassName={"min-w-64"}
                onValueChange={(option) => {
                  setSelectedFilters((prev) => ({
                    ...prev,
                    role: option.value,
                  }));
                }}
              />
            ) : (
              <Badge className="bg-secondary text-secondary-foreground hover:bg-secondary/80 flex h-10 items-center gap-2 px-3 font-normal">
                <span className="capitalize">
                  {findOption(roles, selectedFilters.role)?.label ?? ""}
                </span>
                <button
                  onClick={() => {
                    handleRemoveFilter("role");
                  }}
                  className="flex size-4 cursor-pointer items-center justify-center rounded-full bg-[#161D14] p-1"
                >
                  <X className="size-3 text-white" />
                </button>
              </Badge>
            )}
          </div>
          <div>
            {selectedFilters.status === "all" ? (
              <DropdownComponent
                className={"rounded-full"}
                defaultValue={selectedFilters.status}
                options={STATUS_OPTIONS}
                contentClassName={"min-w-48"}
                onValueChange={(value) => {
                  setSelectedFilters((prev) => ({
                    ...prev,
                    status: value,
                  }));
                }}
              />
            ) : (
              <Badge className="bg-secondary text-secondary-foreground hover:bg-secondary/80 flex h-10 items-center gap-2 px-3 font-normal">
                <span className="capitalize">{selectedFilters.status}</span>
                <button
                  onClick={() => {
                    handleRemoveFilter("status");
                  }}
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
            {selectedFilters.status === STATUSES.pending && (
              <PrimaryButton
                isLoading={isPending}
                onClick={handleBulkResend}
                variant={"secondary"}
                size="sm"
                className={"text-primary text-sm font-semibold"}
                buttonContent={
                  <>
                    {!isPending && <IconMailForward className={"size-4"} />}
                    {t("userTable.resendInvite")}
                  </>
                }
              />
            )}
            {selectedFilters.status === STATUSES.active && (
              <Button
                onClick={handleDeactivateUsers}
                variant={"secondary"}
                size="sm"
                className={"text-sm font-semibold text-[#BA1A1A]"}
              >
                <CircleOff className={"size-4"} />
                {t("userTable.deactivateUsers", {
                  count: rows.length,
                })}
              </Button>
            )}
          </div>
          <Button
            onClick={handleResetToolbar}
            variant={"secondary"}
            size="sm"
            className={"text-sm font-semibold text-[#1A5514]"}
          >
            <RefreshCw className={"size-4"} />
            {t("userTable.resetToolbar")}
          </Button>
        </div>
      )}
    </>
  );
}
