"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@cf/ui";
import { TableProps } from "./types/tables";

function getAlignClass(align?: string) {
    return {
        left: "text-left",
        right: "text-right",
        center: "text-center",
    }[align || "left"];
}

export default function StatisticsTable<T>({
    columns,
    data,
    currentPage,
    totalPages,
    onPageChange,
    itemsPerPage,
    totalItems,
    onViewDetail,
    getRowId,
}: TableProps<T>) {
    return (
        <div className="mt-8 bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="mx-auto max-w-7xl">
                <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                    {/* Desktop */}
                    <div className="hidden overflow-x-auto md:block">
                        <table className="w-full">
                            <thead className="bg-[#F7FAF6]">
                                <tr className="border-b border-slate-200">
                                    {columns.map((col) => (
                                        <th
                                            key={col.id}
                                            className={`px-4 py-3 text-xs font-semibold text-slate-700 ${getAlignClass(
                                                col.align
                                            )}`}
                                        >
                                            {col.label}
                                        </th>
                                    ))}
                                    <th />
                                </tr>
                            </thead>

                            <tbody>
                                {data.map((row) => (
                                    <tr
                                        key={getRowId(row)}
                                        className="border-b border-slate-100 hover:bg-slate-50"
                                    >
                                        {columns.map((col) => (
                                            <td
                                                key={col.id}
                                                className={`px-4 py-4 text-sm ${getAlignClass(
                                                    col.align
                                                )}`}
                                            >
                                                {col.render(row)}
                                            </td>
                                        ))}

                                        <td className="px-4 py-4 text-center">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    onViewDetail(row)
                                                }
                                            >
                                                <ChevronRight className="h-5 w-5" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile */}
                    <div className="divide-y divide-slate-200 md:hidden">
                        {data.map((row) => (
                            <div
                                key={getRowId(row)}
                                className="p-4 hover:bg-slate-50"
                            >
                                {columns.map((col) => (
                                    <div key={col.id} className="mb-2">
                                        <p className="text-xs text-slate-500">
                                            {col.label}
                                        </p>
                                        <div className="text-sm">
                                            {col.render(row)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>

                    {data.length === 0 && (
                        <div className="p-8 text-center text-slate-600">
                            No data found
                        </div>
                    )}
                </div>

                {/* Pagination */}
                <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row text-sm text-slate-600">
                    <span>
                        0 of {totalItems} row(s) selected.
                    </span>

                    <div className="flex items-center gap-2">
                        <span>Rows per page</span>
                        <select className="rounded border px-2 py-1">
                            <option>{itemsPerPage}</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-3">
                        <span>
                            Page {currentPage} of {totalPages || 1}
                        </span>

                        <div className="flex gap-1">
                            <button
                                onClick={() =>
                                    onPageChange(Math.max(1, currentPage - 1))
                                }
                                disabled={currentPage === 1}
                                className="rounded border p-1"
                            >
                                <ChevronDown className="h-4 w-4 rotate-90" />
                            </button>

                            <button
                                onClick={() =>
                                    onPageChange(
                                        Math.min(totalPages, currentPage + 1)
                                    )
                                }
                                disabled={currentPage >= totalPages}
                                className="rounded border p-1"
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