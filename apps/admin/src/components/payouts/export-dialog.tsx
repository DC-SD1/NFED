import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@cf/ui";
import { IconX } from "@tabler/icons-react";
import React, { useState } from "react";

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  data: any[]; // Data to be exported
  onExportSuccess?: () => void;
}

export default function ExportDialog({
  isOpen,
  onClose,
  data,
  onExportSuccess,
}: ExportDialogProps) {
  const [format, setFormat] = useState<"csv" | "excel">("csv");

  const generateCSV = (data: any[]) => {
    if (!data || data.length === 0) return "";

    const headers = Object.keys(data[0]).join(",");
    const rows = data.map((row) =>
      Object.values(row)
        .map((value) => `"${String(value)}"`)
        .join(","),
    );

    return [headers, ...rows].join("\n");
  };

  const handleExport = () => {
    const auditLog = {
      exportedBy: "Current User",
      timestamp: new Date().toISOString(),
      recordCount: data.length,
      format: format,
    };

    console.log("Export Audit Log:", JSON.stringify(auditLog, null, 2));

    const csvContent = generateCSV(data);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `payouts_export_${new Date().toISOString()}.${format === "excel" ? "xls" : "csv"}`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onClose();
    if (onExportSuccess) {
      onExportSuccess();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="gap-0 p-0 sm:max-w-[600px]"
        closeClassName="hidden"
      >
        <DialogHeader className="relative flex flex-row items-center justify-center border-b p-3">
          <button onClick={onClose} className="absolute left-6 outline-none">
            <IconX size={20} className="text-gray-500 hover:text-gray-700" />
          </button>

          <div className=" text-black-500 text-lg font-bold tracking-wider">
            Export items
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-6 p-6">
          <div>
            <span className="mb-4 block text-xs font-semibold uppercase tracking-wider text-gray-500">
              FILE FORMAT
            </span>

            <div className="divide-y divide-gray-200 rounded-lg border border-gray-200">
              <div
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setFormat("csv");
                  }
                }}
                className="flex cursor-pointer items-start justify-between p-4 transition-colors hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                onClick={() => setFormat("csv")}
              >
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    CSV (Recommended)
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Recommended for use with automated tools.
                  </p>
                </div>
                <div className="mt-1">
                  {format === "csv" ? (
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
                  if (e.key === "Enter" || e.key === " ") {
                    setFormat("excel");
                  }
                }}
                className="flex cursor-pointer items-start justify-between p-4 transition-colors hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                onClick={() => setFormat("excel")}
              >
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Excel</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Works with all popular spreadsheet programs like Microsoft
                    Excel, Apple Numbers, and Google Sheets.
                  </p>
                </div>
                <div className="mt-1">
                  {format === "excel" ? (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full border-[6px] border-[#36B92E] bg-white"></div>
                  ) : (
                    <div className="h-6 w-6 rounded-full border border-gray-300 bg-white"></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t p-6">
          <Button
            className="bg-[#36B92E] px-8 text-white hover:bg-[#2da026]"
            onClick={handleExport}
          >
            Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
