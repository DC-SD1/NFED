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
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import React from "react";

import ComplianceBadge from "@/components/common/compliance-badge";
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
import { showErrorToast } from "@/lib/utils/toast";
import type { Buyer } from "@/types/buyer.types";
import { STATUSES } from "@/utils/constants/status-constants";
import { getRowsFromCheckTable } from "@/utils/helpers/table-helpers";
import { ImageAssets } from "@/utils/image-assets";

interface Props<T> {
  data: Buyer[];
  paginateData: PaginateData<T>;
  toolBar?: React.ReactNode;
  isFiltering: boolean;
  useMockData: boolean;
}

export default function BuyerTable<T>({
  data,
  paginateData,
  toolBar,
  isFiltering,
  useMockData,
}: Props<T>) {
  const t = useTranslations("customerManagement.buyer");
  const { addRow, setRows, removeRow } = useTableStore();
  const router = useRouter();
  const pathname = usePathname();
  const { getCountryCode } = useCountries();
  const api = useApiClient();

  const handleRowClick = (buyer: Buyer) => {
    if (
      [
        STATUSES.active,
        STATUSES.deactivated,
        STATUSES.suspended,
        STATUSES["pending suspension"],
      ].includes(buyer.status.toLowerCase())
    ) {
      router.push(`${pathname}/${buyer.id}`);
    }
  };

  const ACTION_CONFIG: TableActionItem<Buyer>[] = [
    {
      icon: <InfoIcon className={"size-4"} />,
      actionName: t("buyerTable.actions.view"),
      action: (row) => {
        router.push(`${pathname}/${row.original.id}`);
      },
    },
  ];

  const columns: ColumnDef<Buyer>[] = [
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
      accessorKey: "organisationId",
      header: t("buyerTable.headers.organizationName"),
      cell: ({ row }) => {
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className={"max-w-[200px] truncate"}>
                  {row.original.organisationId || "-"}
                </p>
              </TooltipTrigger>
              <TooltipContent>
                {row.original.organisationId || "-"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
    },
    {
      accessorKey: "buyerName",
      header: t("buyerTable.headers.name"),
      cell: ({ row }) => {
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className={"max-w-[200px] truncate"}>
                  {row.original.buyerName}
                </p>
              </TooltipTrigger>
              <TooltipContent>{row.original.buyerName}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
    },
    {
      accessorKey: "country",
      header: t("buyerTable.headers.country"),
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
      header: t("buyerTable.headers.email"),
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
      accessorKey: "compliance",
      header: t("buyerTable.headers.complianceStatus"),
      cell: ({ row }) => {
        return row.original.compliance ? (
          <ComplianceBadge compliance={row.original.compliance} />
        ) : (
          <span className="text-sm text-[#525C4E]">-</span>
        );
      },
    },
    {
      accessorKey: "status",
      header: t("buyerTable.headers.status"),
      cell: ({ row }) => {
        return <StatusBadge status={row.original.status} />;
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        return <TableAction actions={ACTION_CONFIG} rowData={row} />;
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
            title={useMockData ? t("emptyState.title") : "No buyers added yet"}
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
          emptyStateTitle={t("buyerTable.noBuyersFound")}
          emptyStateMessage={t("buyerTable.yourSearchResults")}
        />
      )}
    </>
  );
}
