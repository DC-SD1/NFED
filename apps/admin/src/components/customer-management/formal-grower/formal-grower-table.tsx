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

import ContentEmptyState from "@/components/common/content-empty-state";
import FlagComponent from "@/components/common/flag-component";
import StatusBadge from "@/components/common/status-badge";
import type { TableActionItem } from "@/components/table/data-table-component";
import {
  DataTableComponent,
  type PaginateData,
} from "@/components/table/data-table-component";
import TableAction from "@/components/table/table-action";
import { useCountries } from "@/hooks/use-countries";
import { useApiClient } from "@/lib/api";
import useTableStore from "@/lib/stores/table-store/table-store";
import { useModal } from "@/lib/stores/use-modal";
import { showErrorToast } from "@/lib/utils/toast";
import type { FormalGrower } from "@/types/formal-grower.types";
import { STATUSES } from "@/utils/constants/status-constants";
import { filterFormalGrowerActionsByStatus } from "@/utils/helpers/action-filters";
import { getRowsFromCheckTable } from "@/utils/helpers/table-helpers";
import { ImageAssets } from "@/utils/image-assets";

interface Props<T> {
  data: FormalGrower[];
  paginateData: PaginateData<T>;
  toolBar?: React.ReactNode;
  isFiltering: boolean;
}

export default function FormalGrowerTable<T>({
  data,
  paginateData,
  toolBar,
  isFiltering,
}: Props<T>) {
  const t = useTranslations("customerManagement.formalGrower");
  const { addRow, setRows, removeRow } = useTableStore();
  const { onOpen } = useModal();
  const router = useRouter();
  const pathname = usePathname();
  const { getCountryCode } = useCountries();
  const api = useApiClient();

  const { mutate: resendInvite } = api.useMutation(
    "post",
    "/customer-management/formal-growers/resend-invite",
    {
      onError: (error: any) => {
        const errorMessages = error?.errors
          ?.map((err: any) => err.message)
          .join(", ");
        showErrorToast(errorMessages ?? "");
      },
    },
  );

  const handleRowClick = (grower: FormalGrower) => {
    if (
      [
        STATUSES.active,
        STATUSES.deactivated,
        STATUSES.suspended,
        STATUSES["pending suspension"],
      ].includes(grower.status.toLowerCase())
    ) {
      router.push(`${pathname}/${grower.id}`);
    }
  };

  const ACTION_CONFIG: TableActionItem<FormalGrower>[] = [
    {
      icon: <InfoIcon className={"size-4"} />,
      actionName: t("formalGrowerTable.actions.view"),
      action: (row) => {
        router.push(`${pathname}/${row.original.id}`);
      },
    },
    {
      icon: <IconUserX className={"size-4"} />,
      actionName: t("formalGrowerTable.actions.requestSuspension"),
      action: (row) => {
        onOpen("RequestToSuspendGrower", { formalGrower: row.original });
      },
    },
    {
      icon: <IconUserPlus className={"size-4"} />,
      actionName: t("formalGrowerTable.actions.requestReactivation"),
      action: (row) => {
        console.log(row);
      },
    },
    {
      icon: <IconShare3 className={"size-4"} />,
      actionName: t("formalGrowerTable.actions.resendInvite"),
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
      actionName: t("formalGrowerTable.actions.deactivate"),
      action: (row) => {
        console.log(row);
      },
    },
  ];

  const columns: ColumnDef<FormalGrower>[] = [
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
      header: t("formalGrowerTable.headers.name"),
      cell: ({ row }) => {
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className={"max-w-[200px] truncate"}>
                  {row.original.growerName}
                </p>
              </TooltipTrigger>
              <TooltipContent>{row.original.growerName}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
    },
    {
      accessorKey: "assignedAgent",
      header: t("formalGrowerTable.headers.assignedAgent"),
    },
    {
      accessorKey: "country",
      header: t("formalGrowerTable.headers.country"),
      cell: ({ row }) => {
        const code = getCountryCode(row.original.country);
        return (
          <div className="flex items-center gap-2.5">
            {code && <FlagComponent countryCode={code} />}
            <p>{row.original.country}</p>
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: t("formalGrowerTable.headers.email"),
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
    },
    {
      accessorKey: "status",
      header: t("formalGrowerTable.headers.status"),
      cell: ({ row }) => {
        return <StatusBadge status={row.original.status} />;
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const NEW_ACTION_CONFIG = filterFormalGrowerActionsByStatus(
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
            imgSrc={ImageAssets.USERS_SQUARE}
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
          emptyStateTitle={t("formalGrowerTable.noGrowersFound")}
          emptyStateMessage={t("formalGrowerTable.yourSearchResults")}
        />
      )}
    </>
  );
}
