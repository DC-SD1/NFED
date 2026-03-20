"use client";

import { Checkbox } from "@cf/ui";
import { IconTrash } from "@tabler/icons-react";
import type { ColumnDef } from "@tanstack/react-table";
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
import type { CenterAgent } from "@/types/fulfilment-centers.types";
import { getRowsFromCheckTable } from "@/utils/helpers/table-helpers";
import { ImageAssets } from "@/utils/image-assets";

interface Props<T> {
  data: CenterAgent[];
  paginateData: PaginateData<T>;
  toolBar?: React.ReactNode;
  isFiltering?: boolean;
}

export default function CenterAgentTable<T>({
  data,
  paginateData,
  toolBar,
  isFiltering = false,
}: Props<T>) {
  const { addRow, setRows, removeRow } = useTableStore();

  const ACTION_CONFIG: TableActionItem<CenterAgent>[] = [
    {
      className: "text-error-color focus:text-error-color",
      icon: <IconTrash className={"size-4"} />,
      actionName: "Remove",
      action: (_) => {
        // empty
      },
    },
  ];

  const columns: ColumnDef<CenterAgent>[] = [
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
      header: "Agent name",
    },
    {
      accessorKey: "noGrowersAssigned",
      header: "Assigned growers",
    },
    {
      accessorKey: "size",
      header: "Size (Acres)",
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
        return (
          <TableAction
            actions={ACTION_CONFIG}
            rowData={row}
            dropdownClassName={"w-36"}
          />
        );
      },
    },
  ];

  return (
    <>
      {!isFiltering && data.length === 0 ? (
        <div className={"flex h-64 flex-col items-center justify-center"}>
          <ContentEmptyState
            imgSrc={ImageAssets.USERS_CIRCLE2}
            title={"No agent to display"}
            message={
              "Agents linked to fulfilment center will appear here once added."
            }
          />
        </div>
      ) : (
        <DataTableComponent
          toolBar={toolBar}
          columns={columns}
          data={data}
          paginateData={paginateData}
          showRecordSelection={true}
          emptyStateTitle={"No agent found"}
          emptyStateMessage={"Your search results"}
        />
      )}
    </>
  );
}
