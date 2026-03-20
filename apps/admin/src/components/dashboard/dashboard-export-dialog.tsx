"use client";

import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@cf/ui";
import { IconX, IconCalendar } from "@tabler/icons-react";
import React, { useState } from "react";

interface DashboardExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: () => void;
}

export default function DashboardExportDialog({
  isOpen,
  onClose,
  onGenerate,
}: DashboardExportDialogProps) {
  const [filterType, setFilterType] = useState<"all" | "filtered">("filtered");
  const [format, setFormat] = useState<"pdf" | "excel">("pdf");

  const handleExport = () => {
    onGenerate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="gap-0 p-0 sm:max-w-[600px]" closeClassName="hidden">
        {/* Dialog Header */}
        <DialogHeader className="relative flex flex-row items-center justify-center border-b p-3">
          <DialogTitle className="sr-only">Export dialog</DialogTitle>

          <button onClick={onClose} className="absolute left-6 outline-none">
            <IconX size={20} className="text-gray-500 hover:text-gray-700" />
          </button>

          <div className="text-black-500 text-lg font-bold tracking-wider">
            Export report
          </div>
        </DialogHeader>

        {/* Main Content */}
        <div className="flex flex-col gap-6 p-6">
          <div className="divide-y divide-gray-200 rounded-lg border border-gray-200">
            <div
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setFilterType("all");
              }}
              onClick={() => setFilterType("all")}
              className="flex cursor-pointer items-center justify-between p-4 transition-colors hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
            >
              <span className="text-sm font-medium text-gray-900">All items</span>
              <div>
                {filterType === "all" ? (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full border-[6px] border-[#36B92E] bg-white"></div>
                ) : (
                  <div className="h-6 w-6 rounded-full border border-gray-300 bg-white"></div>
                )}
              </div>
            </div>

            <div
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setFilterType("filtered");
              }}
              onClick={() => setFilterType("filtered")}
              className="flex cursor-pointer flex-col p-4 transition-colors hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
            >
              <div className="mb-3 flex w-full items-center justify-between">
                <span className="text-sm font-medium text-gray-900">
                  Items matching applied filters
                </span>
                <div>
                  {filterType === "filtered" ? (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full border-[6px] border-[#36B92E] bg-white"></div>
                  ) : (
                    <div className="h-6 w-6 rounded-full border border-gray-300 bg-white"></div>
                  )}
                </div>
              </div>

              {filterType === "filtered" && (
                <div className="flex w-fit items-center gap-2 rounded-full bg-[#F3F4F1] px-3 py-1.5">
                  <IconCalendar size={16} className="text-gray-500" />
                  <span className="text-xs font-medium text-gray-600">
                    Date range: 1 Oct 2025 – 31 Oct 2025
                  </span>
                  <div className="flex h-4 w-4 items-center justify-center rounded-full border border-gray-400">
                    <div className="h-1 w-1 rounded-full bg-gray-600"></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* File Format Selection */}
          <div>
            <span className="mb-4 block text-xs font-semibold uppercase tracking-wider text-gray-500">
              FILE FORMAT
            </span>
            <div className="divide-y divide-gray-200 rounded-lg border border-gray-200">
              {["pdf", "excel"].map((type) => (
                <div
                  key={type}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") setFormat(type as "pdf" | "excel");
                  }}
                  onClick={() => setFormat(type as "pdf" | "excel")}
                  className="flex cursor-pointer items-start justify-between p-4 transition-colors hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                >
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">
                      {type === "pdf" ? "PDF (Recommended)" : "Excel"}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {type === "pdf"
                        ? "Recommended for use with automated tools."
                        : "Works with all popular spreadsheet programs like Microsoft Excel, Apple Numbers, and Google Sheets."}
                    </p>
                  </div>
                  <div className="mt-1">
                    {format === type ? (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full border-[6px] border-[#36B92E] bg-white"></div>
                    ) : (
                      <div className="h-6 w-6 rounded-full border border-gray-300 bg-white"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="border-t p-6">
          <Button
            className="w-[140px] bg-[#36B92E] px-8 text-white hover:bg-[#2da026]"
            onClick={handleExport}
          >
            Generate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}