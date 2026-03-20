"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { Badge, Button } from "@cf/ui";
import {
  IconAlertTriangle,
  IconCircleCheck,
  IconClockHour4,
} from "@tabler/icons-react";
import React from "react";

// ─── Status config ────────────────────────────────────────────────────────────
// Extend this map whenever new statuses are introduced.
const STATUS_COLORS: Record<string, string> = {
  Paid: "bg-green-50 text-green-700 border-green-200",
  Pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  Overdue: "bg-red-50 text-red-700 border-red-200",
  Success: "bg-green-50 text-green-700 border-green-200",
  Failed: "bg-red-50 text-red-700 border-red-200",
};

const STATUS_ICONS: Record<string, React.ElementType> = {
  Paid: IconCircleCheck,
  Success: IconCircleCheck,
  Pending: IconClockHour4,
  Overdue: IconAlertTriangle,
  Failed: IconAlertTriangle,
};

const DEFAULT_STATUS_COLOR = "bg-slate-50 text-slate-700 border-slate-200";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ColumnAlign = "left" | "right" | "center";

export type Column<TRow = Record<string, unknown>> = {
  /** Must match the key in your row object, or use "action" for the action button */
  id: keyof TRow | "action";
  label: string;
  align?: ColumnAlign;
  /**
   * Optional custom cell renderer.
   * Return `undefined` to fall back to the default renderer.
   */
  render?: (value: unknown, row: TRow) => React.ReactNode;
};

type Props<TRow extends Record<string, unknown>> = {
  columns: Column<TRow>[];
  data: TRow[];
  /** Key used to build stable React keys (defaults to first column id) */
  rowKey?: keyof TRow;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  totalItems: number;
  onViewDetail?: (row: TRow) => void;
  emptyMessage?: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Decides whether a value should be rendered as a status badge */
function isStatusValue(value: unknown): value is string {
  return typeof value === "string" && value in STATUS_COLORS;
}

function StatusBadge({ status }: { status: string }) {
  const colorClass = STATUS_COLORS[status] ?? DEFAULT_STATUS_COLOR;
  const Icon = STATUS_ICONS[status];
  return (
    <Badge
      className={`${colorClass} flex w-fit items-center gap-1 rounded-sm border text-xs font-medium`}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {status}
    </Badge>
  );
}

/** Default cell renderer – handles status badges & plain values */
function DefaultCell({ value }: { value: unknown }) {
  if (isStatusValue(value)) return <StatusBadge status={value} />;
  if (value === null || value === undefined) return <span className="text-slate-400">—</span>;
  return <>{String(value)}</>;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function StatisticsTable<TRow extends Record<string, unknown>>({
  columns,
  data,
  rowKey,
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems,
  onViewDetail,
  emptyMessage = "No data found",
}: Props<TRow>) {
  const firstColId = columns[0]?.id as string | undefined;
  const keyField = (rowKey ?? firstColId) as keyof TRow | undefined;

  // Columns that are NOT the special "action" column
  const dataColumns = columns.filter((col) => col.id !== "action");
  const hasActionColumn = columns.some((col) => col.id === "action");

  // Helper: resolve alignment class
  const alignClass = (align?: ColumnAlign) =>
    align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";

  // Helper: render a single cell
  const renderCell = (col: Column<TRow>, row: TRow) => {
    const value = row[col.id as keyof TRow];
    if (col.render) return col.render(value, row);
    return <DefaultCell value={value} />;
  };

  return (
    <div className="mt-8 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="mx-auto max-w-7xl">
        {/* ── Table container ─────────────────────────────────────────────── */}
        <div className="overflow-hidden rounded-lg bg-white shadow-sm">

          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full">
              <thead className="bg-[#F7FAF6]">
                <tr className="border-b border-slate-200">
                  {columns.map((col) => (
                    <th
                      key={String(col.id)}
                      className={`px-4 py-3 text-xs font-semibold text-slate-700 ${alignClass(col.align)}`}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {data.map((row, idx) => {
                  const key = keyField ? String(row[keyField]) + idx : idx;
                  return (
                    <tr
                      key={key}
                      className="border-b border-slate-100 transition-colors hover:bg-slate-50"
                    >
                      {dataColumns.map((col) => (
                        <td
                          key={String(col.id)}
                          className={`px-4 py-4 text-sm text-slate-700 ${alignClass(col.align)}`}
                        >
                          {renderCell(col, row)}
                        </td>
                      ))}

                      {hasActionColumn && (
                        <td className="px-4 py-4 text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onViewDetail?.(row)}
                            className="text-slate-400 hover:text-slate-600"
                          >
                            <ChevronRight className="h-5 w-5" />
                          </Button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="divide-y divide-slate-200 md:hidden">
            {data.map((row, idx) => {
              const key = keyField ? String(row[keyField]) + idx : idx;
              // First two data columns used as title/subtitle; rest shown as grid
              const [primary, secondary, ...rest] = dataColumns;
              return (
                <div
                  key={key}
                  className="p-4 hover:bg-slate-50"
                  onClick={() => onViewDetail?.(row)}
                >
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      {primary && (
                        <p className="text-sm font-semibold">
                          {renderCell(primary, row)}
                        </p>
                      )}
                      {secondary && (
                        <p className="text-xs text-slate-600">
                          {renderCell(secondary, row)}
                        </p>
                      )}
                    </div>
                    {/* Show status badge in top-right if one of the remaining columns is a status */}
                    {rest.map((col) => {
                      const val = row[col.id as keyof TRow];
                      if (isStatusValue(val)) {
                        return <StatusBadge key={String(col.id)} status={val} />;
                      }
                      return null;
                    })}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {rest
                      .filter((col) => !isStatusValue(row[col.id as keyof TRow]))
                      .map((col) => (
                        <div key={String(col.id)}>
                          <p className="text-slate-500">{col.label}</p>
                          <p className="font-medium">{renderCell(col, row)}</p>
                        </div>
                      ))}
                  </div>
                </div>
              );
            })}
          </div>

          {data.length === 0 && (
            <div className="p-8 text-center text-slate-600">{emptyMessage}</div>
          )}
        </div>

        {/* ── Pagination footer ────────────────────────────────────────────── */}
        <div className="mt-6 flex flex-col items-center justify-between gap-4 text-sm text-slate-600 sm:flex-row">
          <div>
            <span className="text-xs sm:text-sm">
              0 of {totalItems} row(s) selected.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm">Rows per page</span>
            <select className="rounded border border-slate-200 px-2 py-1 text-sm text-slate-700">
              <option>{itemsPerPage}</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs sm:text-sm">
              Page {currentPage} of {totalPages || 1}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="rounded border border-slate-200 p-1 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronDown className="h-4 w-4 rotate-90" />
              </button>
              <button
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage >= totalPages}
                className="rounded border border-slate-200 p-1 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronDown className="h-4 w-4 -rotate-90" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}