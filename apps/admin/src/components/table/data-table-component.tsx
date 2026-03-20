"use client";

import {
  cn,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  useIsMobile,
} from "@cf/ui";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  type PaginationState,
  type Row,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useTranslations } from "next-intl";
import React, { useEffect } from "react";

import ContentEmptyState from "@/components/common/content-empty-state";
import DropdownComponent from "@/components/input-components/dropdown-component";
import useTableStore from "@/lib/stores/table-store/table-store";

interface DataTableProperties<T, TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onRowClick?: (rowData: TData, rowInfo?: Row<TData>) => void;
  paginateData?: PaginateData<T>;
  showRecordSelection?: boolean;
  identifier?: string;
  headerRowClassName?: string;
  thClassName?: string;
  toolBar?: React.ReactNode;
  emptyStateTitle?: string;
  emptyStateMessage?: string;
  emptyStateImgSrc?: string;
  isSmall?: boolean;
  hasEmptyStateImage?: boolean;
  tRowClassName?: string;
  isLoading?: boolean;
  hideHeaderOnEmpty?: boolean;
  hideEmptyState?: boolean;
  hidePaginationOnEmpty?: boolean;
}

export interface TableActionItem<T> {
  icon?: React.ReactNode;
  className?: string;
  actionName: string;
  action: (row: Row<T>) => void;
}

export interface PaginateData<T> {
  pageIndex: number;
  pagination: PaginationState;
  pageSize: number;
  totalPages?: number;
  currentPage?: number;
  setPagination?: (value: T) => void;
}

interface CustomColumnMeta {
  hideOnSmall: boolean;
}

const ROWS_PER_PAGE = [
  { value: "10", label: "10" },
  { value: "20", label: "20" },
  { value: "30", label: "30" },
  { value: "40", label: "40" },
  { value: "50", label: "50" },
];

export function DataTableComponent<T, TData, TValue>({
  onRowClick,
  columns,
  data,
  paginateData,
  showRecordSelection = false,
  headerRowClassName,
  thClassName,
  toolBar,
  emptyStateTitle,
  emptyStateMessage,
  emptyStateImgSrc,
  hasEmptyStateImage = false,
  tRowClassName,
  isLoading = false,
  hideHeaderOnEmpty = false,
  hideEmptyState = false,
  hidePaginationOnEmpty = false,
}: DataTableProperties<T, TData, TValue>) {
  const t = useTranslations("common.tableMetadata");
  const rows = useTableStore.use.rows();
  const isMobile = useIsMobile(1024);
  const table = useReactTable({
    data,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: paginateData?.setPagination as any,
    pageCount: paginateData?.pageSize,
    manualPagination: true,
    state: {
      pagination: paginateData?.pagination,
    },
    enableRowSelection: true,
  });

  useEffect(() => {
    const headerCheckboxExists = table
      .getHeaderGroups()
      .some((headerGroup) =>
        headerGroup.headers.some((header) => header.column.id === "select"),
      );

    if (headerCheckboxExists && rows.length === 0) {
      table.toggleAllPageRowsSelected(false);
    }
  }, [rows, table]);

  useEffect(() => {
    const columnsToHide = table
      .getAllColumns()
      .filter((column) => column.getCanHide());

    columnsToHide.forEach((column) => {
      const meta = column.columnDef.meta as CustomColumnMeta;
      if (meta?.hideOnSmall && isMobile) {
        column.toggleVisibility(false);
      }
    });
  }, [isMobile, table]);

  return (
    <div className="flex flex-col gap-4">
      {toolBar && (!hideHeaderOnEmpty || isLoading || data.length > 0) && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-2">
          {toolBar}
        </div>
      )}
      <div
        className={cn(
          "rounded-md border",
          hideHeaderOnEmpty && !isLoading && data.length === 0 && "border-none",
        )}
      >
        <Table>
          {(!hideHeaderOnEmpty || isLoading || data.length > 0) && (
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className={cn(
                    "whitespace-nowrap bg-[#F3F6F3] hover:bg-[#F3F6F3]",
                    headerRowClassName,
                  )}
                >
                  {headerGroup.headers.map((header, index) => (
                    <TableHead
                      key={header.id}
                      className={cn(
                        "!p-3 font-semibold text-foreground",
                        index === 0 && "rounded-tl-md",
                        index === headerGroup.headers.length - 1 &&
                          "rounded-tr-md",
                        thClassName,
                      )}
                    >
                      {header.isPlaceholder
                        ? undefined
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
          )}
          <TableBody>
            {table?.getRowModel?.().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  className={cn(
                    "whitespace-nowrap",
                    onRowClick && "cursor-pointer",
                    tRowClassName,
                  )}
                  onClick={() => {
                    onRowClick?.(row.original, row);
                  }}
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="!p-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index} className="hover:bg-transparent">
                  {columns.map((column, colIndex) => (
                    <TableCell key={colIndex} className="p-4">
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : !hideEmptyState ? (
              <TableRow className={"hover:bg-transparent"}>
                <TableCell
                  colSpan={columns.length + 1}
                  className="h-40 py-12 text-center"
                >
                  <ContentEmptyState
                    imgSrc={emptyStateImgSrc}
                    title={emptyStateTitle}
                    message={emptyStateMessage}
                    className="!w-auto"
                    hasImage={hasEmptyStateImage}
                  />
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>

      {(!hideHeaderOnEmpty || isLoading || data.length > 0) &&
        (!hidePaginationOnEmpty || data.length > 0) && (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className={"flex-1"}>
              {showRecordSelection && (
                <p className={`flex-1 text-sm ${paginateData ? "" : "mb-4"}`}>
                  {table.getFilteredSelectedRowModel().rows.length} of{" "}
                  {table.getFilteredRowModel().rows.length} {t("rowSelected")}
                </p>
              )}
            </div>
            {paginateData && (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end sm:gap-8">
                <div className="flex items-center gap-4">
                  <p className="text-sm">{t("perPage")}</p>
                  <div className={"w-20"}>
                    <DropdownComponent
                      className={"!bg-white"}
                      options={ROWS_PER_PAGE}
                      value={table.getState().pagination.pageSize.toString()}
                      onValueChange={(value) => {
                        table.setPagination((prev) => ({
                          ...prev,
                          pageSize: Number(value),
                        }));
                      }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <p className="text-sm font-semibold">
                    {t("page")} {paginateData?.currentPage} {t("of")}{" "}
                    {paginateData?.totalPages}
                  </p>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      className="flex size-8 items-center justify-center rounded-md border disabled:cursor-not-allowed"
                      onClick={() => {
                        table.setPagination({
                          pageIndex: table.getState().pagination.pageIndex - 1,
                          pageSize: table.getState().pagination.pageSize,
                        });
                      }}
                      disabled={table.getState().pagination.pageIndex <= 1}
                    >
                      <ChevronLeft
                        className={cn(
                          "size-4",
                          table.getState().pagination.pageIndex <= 1 &&
                            "text-gray-400",
                        )}
                      />
                    </button>

                    <button
                      type="button"
                      className="flex size-8 items-center justify-center rounded-md border disabled:cursor-not-allowed"
                      onClick={() => {
                        table.setPagination((prev) => ({
                          ...prev,
                          pageIndex: 1,
                        }));
                      }}
                      disabled={table.getState().pagination.pageIndex <= 1}
                    >
                      <ChevronsLeft
                        className={cn(
                          "size-4",
                          table.getState().pagination.pageIndex <= 1 &&
                            "text-gray-400",
                        )}
                      />
                    </button>

                    <button
                      type="button"
                      className="flex size-8 items-center justify-center rounded-md border disabled:cursor-not-allowed"
                      onClick={() => {
                        table.nextPage();
                      }}
                      disabled={
                        table.getState().pagination.pageIndex >=
                        (paginateData?.totalPages ?? 0)
                      }
                    >
                      <ChevronRight
                        className={cn(
                          "size-4",
                          table.getState().pagination.pageIndex >=
                            (paginateData?.totalPages ?? 0) && "text-gray-400",
                        )}
                      />
                    </button>

                    <button
                      type="button"
                      className="flex size-8 items-center justify-center rounded-md border disabled:cursor-not-allowed"
                      onClick={() => {
                        table.setPagination((prev) => ({
                          ...prev,
                          pageIndex: paginateData?.totalPages ?? 1,
                        }));
                      }}
                      disabled={
                        table.getState().pagination.pageIndex >=
                        (paginateData?.totalPages ?? 0)
                      }
                    >
                      <ChevronsRight
                        className={cn(
                          "size-4",
                          table.getState().pagination.pageIndex >=
                            (paginateData?.totalPages ?? 0) && "text-gray-400",
                        )}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
    </div>
  );
}

export type { PaginationState } from "@tanstack/react-table";
