"use client";

import {
  Checkbox,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@cf/ui";
import { IconShare3, IconUserPlus, IconUserX } from "@tabler/icons-react";
import type { ColumnDef } from "@tanstack/react-table";
import { CircleOff, InfoIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import React from "react";

import CopyTextButton from "@/components/buttons/copy-text-button";
import StatusBadge from "@/components/common/status-badge";
import type { TableActionItem } from "@/components/table/data-table-component";
import {
  DataTableComponent,
  type PaginateData,
} from "@/components/table/data-table-component";
import TableAction from "@/components/table/table-action";
import useTableStore from "@/lib/stores/table-store/table-store";
import type { Agent } from "@/types/agent.types";
import { STATUSES } from "@/utils/constants/status-constants";
import { filterAgentTableActionsByStatus } from "@/utils/helpers/action-filters";
import { getRowsFromCheckTable } from "@/utils/helpers/table-helpers";

interface Props<T> {
  data: Agent[];
  paginateData: PaginateData<T>;
  toolBar?: React.ReactNode;
}

export default function AgentsTable<T>({
  data,
  paginateData,
  toolBar,
}: Props<T>) {
  const t = useTranslations("customerManagement.agents");
  const { addRow, setRows, removeRow } = useTableStore();
  const router = useRouter();
  const pathname = usePathname();

  // TODO: USE LATER
  // const api = useApiClient();
  // const { mutate: resendInvite } = api.useMutation(
  //   "post",
  //   "/customer-management/formal-growers/resend-invite",
  //   {
  //     onError: (error: any) => {
  //       const errorMessages = error?.errors
  //         ?.map((err: any) => err.message)
  //         .join(", ");
  //       showErrorToast(errorMessages ?? "");
  //     },
  //   },
  // );

  const handleRowClick = (agent: Agent) => {
    if (
      [
        STATUSES.active,
        STATUSES.deactivated,
        STATUSES.suspended,
        STATUSES["pending suspension"],
      ].includes(agent.status.toLowerCase())
    ) {
      router.push(`${pathname}/${agent.id}`);
    }
  };

  const ACTION_CONFIG: TableActionItem<Agent>[] = [
    {
      icon: <InfoIcon className={"size-4"} />,
      actionName: t("agentsTable.actions.view"),
      action: (row) => {
        router.push(`${pathname}/${row.original.id}`);
      },
    },
    {
      icon: <IconUserX className={"size-4"} />,
      actionName: t("agentsTable.actions.requestSuspension"),
      action: (_) => {
        // empty
      },
    },
    {
      icon: <IconUserPlus className={"size-4"} />,
      actionName: t("agentsTable.actions.requestReactivation"),
      action: (row) => {
        console.log(row);
      },
    },
    {
      icon: <IconShare3 className={"size-4"} />,
      actionName: t("agentsTable.actions.resendInvite"),
      action: (row) => {
        console.log(row);
      },
    },
    {
      className: "text-red-dark",
      icon: <CircleOff className={"size-4"} />,
      actionName: t("agentsTable.actions.deactivate"),
      action: (row) => {
        console.log(row);
      },
    },
  ];

  const columns: ColumnDef<Agent>[] = [
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
      accessorKey: "growerName",
      header: t("agentsTable.headers.name"),
      cell: ({ row }) => {
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className={"max-w-[200px] truncate"}>
                  {row.original.agentName}
                </p>
              </TooltipTrigger>
              <TooltipContent>{row.original.agentName}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
    },
    {
      accessorKey: "assignedRoM",
      header: t("agentsTable.headers.assignedRom"),
    },
    {
      accessorKey: "noOfSMF",
      header: t("agentsTable.headers.noOfSmf"),
    },
    {
      accessorKey: "fulfillmentCenter",
      header: t("agentsTable.headers.fulfillmentCenter"),
    },
    {
      accessorKey: "phoneNumber",
      header: t("agentsTable.headers.phoneNumber"),
      cell: ({ row }) => {
        return (
          <div className="group flex items-center gap-4">
            {row.original.phoneNumber}
            <div className="opacity-0 transition-opacity group-hover:opacity-100">
              <CopyTextButton
                className={
                  "flex size-6 items-center justify-center rounded border bg-white"
                }
                textToCopy={row.original.phoneNumber}
                iconClassName={"!size-3"}
              />
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: t("agentsTable.headers.status"),
      cell: ({ row }) => {
        return <StatusBadge status={row.original.status} />;
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const NEW_ACTION_CONFIG = filterAgentTableActionsByStatus(
          ACTION_CONFIG,
          row.original.status,
          (key) => t(key as any),
        );

        return <TableAction actions={NEW_ACTION_CONFIG} rowData={row} />;
      },
    },
  ];

  return (
    <DataTableComponent
      toolBar={toolBar}
      columns={columns}
      data={data}
      onRowClick={handleRowClick}
      paginateData={paginateData}
      showRecordSelection={true}
      emptyStateTitle={t("agentsTable.noAgentsFound")}
      emptyStateMessage={t("agentsTable.yourSearchResults")}
    />
  );
}
