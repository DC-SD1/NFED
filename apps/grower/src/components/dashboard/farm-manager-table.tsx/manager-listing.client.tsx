"use client";

import { Checkbox, Table, TableBody, TableCell, TableRow } from "@cf/ui";
import { Button } from "@cf/ui/components/button";
import type { RowSelectionState, Updater } from "@tanstack/react-table";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { CheckIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

import type { FarmManagerTableRow } from "@/types/farm-manager-item";
import { exportToCSV } from "@/utils/export-to-csv";
import { getCSVColumns } from "@/utils/mapping-helper";

import {
  draftManagerColumns as draftColumns,
  farmManagerColumns as managerColumns,
} from "./columns";
import { DataTableHeader } from "./data-table-header";

interface CSVColumn<T> {
  header: string;
  accessor: (item: T) => string | number | null | undefined;
}
interface DataTableProps {
  data: FarmManagerTableRow[];
  pageCount: number;
  loading?: boolean;
  onRowSelectionChange?: (selection: RowSelectionState) => void;
  showDraftColumns?: boolean;
  exportClicked?: boolean;
  activeFilter?: string;
}

function TableClient({
  data,
  loading = false,
  onRowSelectionChange,
  showDraftColumns = false,
  exportClicked = false,
  activeFilter = "All",
}: DataTableProps) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  useEffect(() => {
    setRowSelection({});
  }, [data]);

  const handleRowSelectionChange = (
    updaterOrValue: Updater<RowSelectionState>,
  ) => {
    const newSelection =
      typeof updaterOrValue === "function"
        ? updaterOrValue(rowSelection)
        : updaterOrValue;

    setRowSelection(newSelection);
    if (onRowSelectionChange) {
      onRowSelectionChange(newSelection);
    }
  };

  const typedColumns: ColumnDef<any>[] = showDraftColumns
    ? draftColumns
    : managerColumns;

  const table = useReactTable({
    data,
    columns: typedColumns,
    state: {
      rowSelection,
    },
    enableRowSelection: true,
    onRowSelectionChange: handleRowSelectionChange,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
  });

  useEffect(() => {
    if (!exportClicked) return;

    const selectedRows = table
      .getSelectedRowModel()
      .rows.map((row) => row.original);
    const exportData = selectedRows.length > 0 ? selectedRows : data;

    const exportColumns: CSVColumn<any>[] = getCSVColumns(
      showDraftColumns ? draftColumns : managerColumns,
    );

    const exportScope = selectedRows.length > 0 ? "selected" : "all";
    const exportFilter = activeFilter?.toLowerCase?.() || "all";

    const filename = `farm-managers-${exportScope}-${exportFilter}.csv`;

    exportToCSV(exportData, exportColumns, filename);

    setTimeout(() => {
      const event = new CustomEvent("reset-export-clicked");
      window.dispatchEvent(event);
    }, 100);
  }, [exportClicked, table, data, showDraftColumns, activeFilter]);

  const currentPage = table.getState().pagination.pageIndex + 1;
  const totalPages = table.getPageCount();
  const hasNextPage = table.getCanNextPage();
  const hasPreviousPage = table.getCanPreviousPage();

  return (
    <div className="rounded-md">
      <Table>
        <DataTableHeader
          table={table}
          loading={loading}
          showDraftColumns={showDraftColumns}
        />
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              className="rounded-xl border-b-8 border-[#F7F7F7] bg-white"
              data-state={row.getIsSelected() && "selected"}
            >
              <TableCell className="hidden px-3 py-2 md:table-cell md:px-4">
                <Checkbox
                  checked={row.getIsSelected()}
                  className="border-foreground"
                  onCheckedChange={(value) => row.toggleSelected(!!value)}
                >
                  {row.getIsSelected() && (
                    <CheckIcon className="text-primary size-4" />
                  )}
                </Checkbox>
              </TableCell>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} className="p-2 md:px-4">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 py-4">
          <div className="flex items-center space-x-2">
            <p className="text-muted-foreground text-sm">
              Showing {table.getRowModel().rows.length} items of {data.length}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="unstyled"
              size="sm"
              onClick={() => table.previousPage()}
              className={`flex items-center gap-1 px-3 py-2 ${hasPreviousPage ? "text-primary-dark" : "text-primary"}`}
              disabled={!hasPreviousPage}
            >
              <ChevronLeft className="size-4" />
              Prev
            </Button>

            <div className="flex items-center space-x-10">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (pageNum) => (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "unstyled"}
                    size="sm"
                    onClick={() => table.setPageIndex(pageNum - 1)}
                    className={`bg-primary-dark size-8 rounded-full p-0 ${
                      currentPage !== pageNum
                        ? "border-none bg-transparent"
                        : ""
                    }`}
                  >
                    {pageNum}
                  </Button>
                ),
              )}
            </div>

            <Button
              variant="unstyled"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!hasNextPage}
              className={`flex items-center gap-1 px-3 py-2 ${hasPreviousPage ? "text-primary-dark" : "text-primary"}`}
            >
              Next
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TableClient;
