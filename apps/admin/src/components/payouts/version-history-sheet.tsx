import {
  Button,
  Checkbox,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@cf/ui";
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconX,
} from "@tabler/icons-react";
import React, { useState } from "react";

import { showSuccessToast } from "@/lib/utils/toast";

import ExportDialog from "./export-dialog";

interface VersionHistorySheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const historyData = [
  {
    id: 1,
    action: "Delivery date updated from 28 Oct 2025 to 30 Oct 2025",
    date: "25 Oct 2025 – 04:00 PM",
    user: "John Doe",
    initial: "J",
  },
  {
    id: 2,
    action: "File uploaded",
    date: "25 Oct 2025 – 04:00 PM",
    user: "John Doe",
    initial: "J",
  },
  {
    id: 3,
    action: "Payout created",
    date: "25 Oct 2025 – 04:00 PM",
    user: "John Doe",
    initial: "J",
  },
];

export default function VersionHistorySheet({
  isOpen,
  onClose,
}: VersionHistorySheetProps) {
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        className="flex w-full flex-col gap-0 p-0 sm:max-w-xl [&>button]:hidden"
        overlayClassName="bg-black/10 backdrop-blur-sm"
      >
        <SheetHeader className="relative flex flex-row items-center justify-center space-y-0 border-b p-4">
          <div className="absolute left-4 flex items-center">
            <button onClick={onClose} className="mr-4 outline-none">
              <IconX size={20} className="text-gray-500 hover:text-gray-700" />
            </button>
            <div className="h-6 w-px bg-gray-200" />
          </div>
          <SheetTitle className="text-base font-semibold">
            Version history
          </SheetTitle>
          <div className="absolute right-4">
            <Button
              variant="ghost"
              className="h-[36px] bg-[#E8F3E5] text-sm font-bold leading-5 text-[#1A5514] hover:bg-[#d9ead6]"
              onClick={() => setIsExportDialogOpen(true)}
            >
              Export history
            </Button>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-6 flex gap-3">
            <Select>
              <SelectTrigger className="w-[140px] rounded-full border-none bg-[#E8EBE1] text-sm font-normal">
                <SelectValue placeholder="All actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All actions</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-[100px] rounded-full border-none bg-[#E8EBE1] text-sm font-normal">
                <SelectValue placeholder="Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg border">
            <div className="flex items-center border-b bg-[#F3F6F3] p-4">
              <Checkbox className="mr-4 border-gray-300 data-[state=checked]:border-[#1A5514] data-[state=checked]:bg-[#1A5514]" />
              <span className="text-sm font-semibold">Action</span>
            </div>
            <div>
              {historyData.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start border-b p-4 last:border-b-0"
                >
                  <Checkbox className="mr-4 mt-1 border-gray-300 data-[state=checked]:border-[#1A5514] data-[state=checked]:bg-[#1A5514]" />
                  <div className="flex-1">
                    <p className="mb-1 text-sm text-gray-900">{item.action}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{item.date}</span>
                      <div className="h-3 w-px bg-gray-300" />
                      <div className="flex items-center gap-1">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1A5514] text-[10px] font-medium text-white">
                          {item.initial}
                        </div>
                        <span className="font-medium text-gray-900">
                          {item.user}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Rows per page</span>
              <Select defaultValue="10">
                <SelectTrigger className="h-8 w-[60px] rounded-md border border-gray-200 bg-white text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Page 1 of 1</span>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-md border-gray-200 p-0 text-gray-400"
                  disabled
                >
                  <IconChevronLeft size={16} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-md border-gray-200 p-0 text-gray-400"
                  disabled
                >
                  <IconChevronsLeft size={16} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-md border-gray-200 p-0 text-gray-400"
                  disabled
                >
                  <IconChevronRight size={16} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-md border-gray-200 p-0 text-gray-400"
                  disabled
                >
                  <IconChevronsRight size={16} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
      <ExportDialog
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
        data={historyData}
        onExportSuccess={() =>
          showSuccessToast("Version history exported successfully")
        }
      />
    </Sheet>
  );
}
