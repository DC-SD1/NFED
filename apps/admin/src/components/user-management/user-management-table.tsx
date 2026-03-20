"use client";

import {
  Checkbox,
  cn,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@cf/ui";
import { IconMailForward } from "@tabler/icons-react";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { CircleOff, Edit, InfoIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import React from "react";

import ContentEmptyState from "@/components/common/content-empty-state";
import StatusBadge from "@/components/common/status-badge";
import type { TableActionItem } from "@/components/table/data-table-component";
import {
  DataTableComponent,
  type PaginateData,
} from "@/components/table/data-table-component";
import TableAction from "@/components/table/table-action";
import { useApiClient } from "@/lib/api";
import useTableStore from "@/lib/stores/table-store/table-store";
import { useModal } from "@/lib/stores/use-modal";
import { showErrorToast } from "@/lib/utils/toast";
import type { User } from "@/types/user-management.types";
import { filterUserActionsByStatus } from "@/utils/helpers/action-filters";
import { getRowsFromCheckTable } from "@/utils/helpers/table-helpers";

interface Props<T> {
  data: User[];
  paginateData: PaginateData<T>;
  toolBar?: React.ReactNode;
  isFiltering: boolean;
}

export default function UserManagementTable<T>({
  data,
  paginateData,
  toolBar,
  isFiltering,
}: Props<T>) {
  const { onOpen } = useModal();
  const t = useTranslations("userManagement");
  const { addRow, setRows, removeRow } = useTableStore();
  const api = useApiClient();

  const handleRowClick = (user: User) => {
    onOpen("UserDetails", { user });
  };

  const { mutate: resendInvite } = api.useMutation(
    "post",
    "/admin/dashboard/users/resend-invite",
    {
      onError: (error: any) => {
        const errorMessages = error?.errors
          ?.map((err: any) => err.message)
          .join(", ");
        showErrorToast(errorMessages ?? "");
      },
    },
  );

  const ACTION_CONFIG: TableActionItem<User>[] = [
    {
      icon: <InfoIcon className={"size-4"} />,
      actionName: t("userTable.actions.view"),
      action: (row) => {
        onOpen("UserDetails", { user: row.original });
      },
    },
    {
      icon: <Edit className={"size-4"} />,
      actionName: t("userTable.actions.edit"),
      action: (row) => {
        onOpen("EditUserRole", { user: row.original });
      },
    },
    {
      icon: <IconMailForward className={"size-4"} />,
      actionName: t("userTable.actions.resendInvite"),
      action: (row) => {
        resendInvite({
          body: {
            invitationIds: [row.original.id],
          },
        });
      },
    },
    {
      className: "text-red-dark",
      icon: <CircleOff className={"size-4"} />,
      actionName: t("userTable.actions.deactivate"),
      action: (row) => {
        onOpen("DestructiveConfirmation", {
          users: [row.original],
          isBulk: false,
        });
      },
    },
  ];

  const columns: ColumnDef<User>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          className={"border-[#E5E8DF] bg-white"}
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => {
            table.toggleAllPageRowsSelected(!!value);
            setRows(
              value ? getRowsFromCheckTable(table.getRowModel().rows) : [],
            );
          }}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          className={"border-[#E5E8DF] bg-white"}
          onClick={(e) => {
            e.stopPropagation();
          }}
          checked={row.getIsSelected()}
          onCheckedChange={(value) => {
            row.toggleSelected(!!value);
            if (value) {
              addRow({ id: row.id, data: row.original });
            } else {
              removeRow(row.id);
            }
          }}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "firstName",
      header: "Full name",
      cell: ({ row }) => {
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className={"max-w-[200px] truncate"}>
                  {row.original.firstName} {row.original.lastName}
                </p>
              </TooltipTrigger>
              <TooltipContent>
                {row.original.firstName} {row.original.lastName}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => {
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className={"max-w-[150px] truncate"}>{row.original.email}</p>
              </TooltipTrigger>
              <TooltipContent>{row.original.email}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
      meta: {
        hideOnSmall: true,
      },
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className={cn("truncate", "max-w-[160px]")}>
                  {row.original.name ?? row.original.role}
                </p>
              </TooltipTrigger>
              <TooltipContent>
                {row.original.name ?? row.original.role}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
    },
    {
      accessorKey: "department",
      header: "Department",
      meta: {
        hideOnSmall: true,
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => {
        return (
          <p>{format(new Date(row.original.createdAt), "dd-MMM-yyy hh:mma")}</p>
        );
      },
      meta: {
        hideOnSmall: true,
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        return <StatusBadge status={row.original.status} />;
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const NEW_ACTION_CONFIG = filterUserActionsByStatus(
          ACTION_CONFIG,
          row.original.status,
          (key) => t(key as any),
        );

        return <TableAction actions={NEW_ACTION_CONFIG} rowData={row} />;
      },
    },
  ];

  return (
    <>
      {!isFiltering && data.length === 0 ? (
        <div
          className={"flex h-72 flex-col items-center justify-center sm:h-96"}
        >
          <ContentEmptyState
            title={t("emptyState.title")}
            message={t("emptyState.description")}
          />
        </div>
      ) : (
        <DataTableComponent
          toolBar={toolBar}
          columns={columns}
          data={data}
          onRowClick={handleRowClick}
          paginateData={paginateData}
          showRecordSelection={true}
          emptyStateTitle={t("userTable.noUsersFound")}
          emptyStateMessage={t("userTable.yourSearchResults")}
        />
      )}
    </>
  );
}
