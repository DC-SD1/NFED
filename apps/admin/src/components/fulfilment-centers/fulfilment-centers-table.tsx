"use client";

import { Checkbox } from "@cf/ui";
import { IconArchive, IconEdit, IconInfoCircle } from "@tabler/icons-react";
import type { ColumnDef } from "@tanstack/react-table";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import React from "react";

import CopyTextButton from "@/components/buttons/copy-text-button";
import ContentEmptyState from "@/components/common/content-empty-state";
import FlagComponent from "@/components/common/flag-component";
import type { TableActionItem } from "@/components/table/data-table-component";
import {
  DataTableComponent,
  type PaginateData,
} from "@/components/table/data-table-component";
import TableAction from "@/components/table/table-action";
import { useCountries } from "@/hooks/use-countries";
import useFulfilmentCenterStore from "@/lib/stores/fulfilment-center-store/fufilment-center-store";
import useTableStore from "@/lib/stores/table-store/table-store";
import { useModal } from "@/lib/stores/use-modal";
import type { FulfilmentCenter } from "@/types/fulfilment-centers.types";
import { getRowsFromCheckTable } from "@/utils/helpers/table-helpers";
import { ImageAssets } from "@/utils/image-assets";

interface Props<T> {
  data: FulfilmentCenter[];
  paginateData: PaginateData<T>;
  toolBar?: React.ReactNode;
  isFiltering: boolean;
}

export default function FulfilmentCentersTable<T>({
  data,
  paginateData,
  toolBar,
  isFiltering,
}: Props<T>) {
  const { addRow, setRows, removeRow } = useTableStore();
  const { onOpen } = useModal();
  const reset = useFulfilmentCenterStore.use.reset();
  const { getCountryCode } = useCountries();
  const t = useTranslations("fulfillmentCenters.table");
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigate = (row: FulfilmentCenter) => {
    router.push(`${pathname}/${row.id}`);
  };

  const ACTION_CONFIG: TableActionItem<FulfilmentCenter>[] = [
    {
      icon: <IconInfoCircle className={"size-6"} />,
      actionName: t("actions.viewDetail"),
      action: (row) => {
        handleNavigate(row.original);
      },
    },
    {
      icon: <IconEdit className={"size-6"} />,
      actionName: t("actions.editCenter"),
      action: (row) => {
        reset();
        onOpen("EditFulfilmentCenter", {
          center: row.original,
        });
      },
    },
    {
      className: "text-error-color focus:text-error-color",
      icon: <IconArchive className={"size-6"} />,
      actionName: t("actions.archiveCenter"),
      action: (_) => {
        // empty
      },
    },
  ];

  const columns: ColumnDef<FulfilmentCenter>[] = [
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
    },
    {
      accessorKey: "country",
      header: t("headers.country"),
      cell: ({ row }) => {
        const code = getCountryCode(row.original.country ?? "");
        return (
          <div className="flex items-center gap-2.5">
            {code && <FlagComponent countryCode={code} />}
            <p>{row.original.country}</p>
          </div>
        );
      },
    },
    {
      accessorKey: "locationAddress",
      header: t("headers.location"),
      cell: ({ row }) => row.original.locationAddress ?? "N/A",
    },
    {
      accessorKey: "phoneNumber",
      header: t("headers.phoneNumber"),
      cell: ({ row }) => {
        return (
          <div className="group flex items-center gap-4">
            {row.original.phoneNumber ?? "N/A"}
            {row.original.phoneNumber && (
              <div>
                <CopyTextButton
                  className={
                    "flex size-6 items-center justify-center rounded border bg-white"
                  }
                  textToCopy={row.original.phoneNumber ?? ""}
                  iconClassName={"!size-3"}
                />
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "regionalManager",
      header: t("headers.regionalManager"),
      cell: ({ row }) =>
        row.original.managers?.find(
          (manager) => manager.role === "RegionalOperationsManager",
        )?.fullName ?? "N/A",
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
            className={"w-80"}
            imgSrc={ImageAssets.FACTORY}
            title={t("emptyState.title")}
            message={t("emptyState.description")}
          />
        </div>
      ) : (
        <DataTableComponent
          toolBar={toolBar}
          columns={columns}
          onRowClick={handleNavigate}
          data={data}
          paginateData={paginateData}
          showRecordSelection={true}
          emptyStateTitle={t("filterEmptyState.title")}
          emptyStateMessage={t("filterEmptyState.description")}
        />
      )}
    </>
  );
}
