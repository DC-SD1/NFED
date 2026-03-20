"use client";

import {
  Checkbox,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@cf/ui";
import type { ColumnDef } from "@tanstack/react-table";
import { InfoIcon } from "lucide-react";
import Image from "next/image";
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
import useTableStore from "@/lib/stores/table-store/table-store";
import { useModal } from "@/lib/stores/use-modal";
import type { AgentFarmer } from "@/types/agent.types";
import { STATUSES } from "@/utils/constants/status-constants";
import { getRowsFromCheckTable } from "@/utils/helpers/table-helpers";
import { ImageAssets } from "@/utils/image-assets";
import { UserShareAlternative } from "@/utils/svg-icons";

interface Props<T> {
  data: AgentFarmer[];
  paginateData: PaginateData<T>;
  toolBar?: React.ReactNode;
  isFiltering?: boolean;
}

export default function AgentFarmersTable<T>({
  data,
  paginateData,
  toolBar,
  isFiltering = false,
}: Props<T>) {
  const t = useTranslations(
    "customerManagement.agents.details.farmersTab.table",
  );
  const { onOpen } = useModal();
  const { addRow, setRows, removeRow } = useTableStore();

  const ACTION_CONFIG: TableActionItem<AgentFarmer>[] = [
    {
      icon: <InfoIcon className={"size-4"} />,
      actionName: t("actions.viewDetail"),
      action: (_) => {
        // empty
      },
    },
    {
      icon: <UserShareAlternative size={"16"} />,
      actionName: t("actions.reassignFarmland"),
      action: (_) => {
        onOpen("ReassignAgentToFarmland");
      },
    },
  ];

  const columns: ColumnDef<AgentFarmer>[] = [
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
      accessorKey: "name",
      header: t("headers.name"),
      cell: ({ row }) => {
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={"flex items-center gap-2.5"}>
                  <Image
                    src={ImageAssets.AGENT_AVATAR}
                    alt={"Avatar"}
                    className={"size-5 rounded-full object-contain"}
                  />
                  <p className={"max-w-[200px] truncate"}>
                    {row.original.name}
                  </p>
                </div>
              </TooltipTrigger>
              <TooltipContent>{row.original.name}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
    },
    {
      accessorKey: "growerType",
      header: t("headers.growerType"),
    },
    {
      accessorKey: "farm",
      header: t("headers.farm"),
    },
    {
      accessorKey: "fulfilmentCenter",
      header: t("headers.fulfillmentCenter"),
      cell: ({ row }) => (
        <p className={"max-w-[200px] truncate"}>
          {row.original.fulfilmentCenter}
        </p>
      ),
    },
    {
      accessorKey: "status",
      header: t("headers.status"),
      cell: ({ row }) => {
        return <StatusBadge status={row.original.status} />;
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const isInactive =
          row.original.status.toLowerCase() === STATUSES.inactive;
        const actions = ACTION_CONFIG.filter(
          (action) => action.actionName === t("actions.viewDetail"),
        );
        if (isInactive) {
          return <TableAction actions={actions} rowData={row} />;
        }
        return <TableAction actions={ACTION_CONFIG} rowData={row} />;
      },
    },
  ];

  return (
    <>
      {!isFiltering && data.length === 0 ? (
        <div className={"flex h-64 flex-col items-center justify-center"}>
          <ContentEmptyState
            imgSrc={ImageAssets.USERS_CIRCLE2}
            title={t("emptyState.title")}
            message={t("emptyState.description")}
          />
        </div>
      ) : (
        <DataTableComponent
          toolBar={toolBar}
          columns={columns}
          data={data}
          paginateData={paginateData}
          showRecordSelection={true}
          emptyStateTitle={t("searchEmptyState.title")}
          emptyStateMessage={t("searchEmptyState.description")}
        />
      )}
    </>
  );
}
