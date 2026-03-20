"use client";

import { Button } from "@cf/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@cf/ui/components/select";
import { IconFileDownload } from "@tabler/icons-react";
import React, { useState } from "react";

import { showSuccessToast } from "@/lib/utils/toast";

import ExportDialog from "./export-dialog";
import type { Transaction } from "./transactions-table";

interface PayoutsHeaderProps {
  data: Transaction[];
  timeframe: string;
  setTimeframe: (value: string) => void;
}

export default function PayoutsHeader({
  data,
  timeframe,
  setTimeframe,
}: PayoutsHeaderProps) {
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h1 className="text-2xl font-bold text-gray-900">Payouts</h1>
      <div className="flex items-center gap-3">
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="h-[36px] w-[130px] gap-2 border-none bg-[#E8F3E5] px-3 py-2 text-sm font-bold leading-5 text-[#1A5514] hover:bg-[#d9ead6]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="this-week">This week</SelectItem>
            <SelectItem value="this-month">This month</SelectItem>
            <SelectItem value="all-time">All time</SelectItem>
            <SelectItem value="no-data">No data</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          className="h-[36px] gap-2 border-none bg-[#E8F3E5] px-3 py-2 text-sm font-bold leading-5 text-[#1A5514] hover:bg-[#d9ead6]"
          onClick={() => setIsExportDialogOpen(true)}
        >
          <IconFileDownload size={18} />
          Export
        </Button>
      </div>

      <ExportDialog
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
        data={data}
        onExportSuccess={() =>
          showSuccessToast("Payouts exported successfully")
        }
      />
    </div>
  );
}
