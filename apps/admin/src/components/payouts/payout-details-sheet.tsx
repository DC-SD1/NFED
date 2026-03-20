import {
  Badge,
  Button,
  Checkbox,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@cf/ui";
import {
  IconChevronRight,
  IconCircleX,
  IconEye,
  IconLoader,
  IconX,
} from "@tabler/icons-react";
import Image from "next/image";
import React, { useState } from "react";

import { showSuccessToast } from "@/lib/utils/toast";
import { ImageAssets } from "@/utils/image-assets";

import ExportDialog from "./export-dialog";
import type { Transaction } from "./transactions-table";
import VersionHistorySheet from "./version-history-sheet";

interface PayoutDetailsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

export default function PayoutDetailsSheet({
  isOpen,
  onClose,
  transaction,
}: PayoutDetailsSheetProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  if (!transaction) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        className="flex w-full flex-col gap-0 p-0 sm:max-w-md [&>button]:hidden"
        overlayClassName="bg-black/10 backdrop-blur-sm"
      >
        <SheetHeader className="relative flex flex-row items-center justify-center space-y-0 p-6 pb-2">
          <div className="absolute left-6 flex items-center">
            <button onClick={onClose} className="mr-4 outline-none">
              <IconX size={20} className="text-gray-500 hover:text-gray-700" />
            </button>
            <div className="h-6 w-px bg-gray-200" />
          </div>
          <SheetTitle>Payout details</SheetTitle>
        </SheetHeader>

        <div
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              setIsVersionHistoryOpen(true);
            }
          }}
          onClick={() => setIsVersionHistoryOpen(true)}
          className="flex items-center justify-between bg-[#F3F6F3] px-6 py-3 text-xs text-gray-500 focus:bg-gray-100 focus:outline-none"
        >
          <span>Last Updated 26 Oct 2025 – 3:00PM</span>
          <IconChevronRight size={16} />
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="mb-2 flex items-center gap-3">
            <h2 className="text-2xl font-bold">{transaction.payoutId}</h2>
            {(() => {
              const status = transaction.status;
              let colorClass = "";
              let icon = null;

              switch (status) {
                case "Pending":
                  colorClass = "text-orange-600 border-orange-200";
                  icon = <IconLoader className="animate-spin" size={14} />;
                  break;
                case "Reversed":
                  colorClass = "text-blue-600 border-blue-200";
                  icon = (
                    <Image
                      src={ImageAssets.PAYOUT_REVERSED_ICON}
                      alt="Reversed"
                      width={14}
                      height={14}
                    />
                  );
                  break;
                case "Failed":
                  colorClass = "text-red-600 border-red-200";
                  icon = <IconCircleX size={14} />;
                  break;
              }

              return (
                <Badge
                  variant="outline"
                  className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium ${colorClass}`}
                >
                  {icon}
                  {status}
                </Badge>
              );
            })()}
          </div>
          <div className="-mx-6 mb-2 h-px bg-[#F3F7F2]" />

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="-mx-6 flex h-auto w-[calc(100%+48px)] rounded-none border-b bg-transparent p-0">
              <TabsTrigger
                value="overview"
                className="flex-1 rounded-none border-b-2 border-transparent px-0 pb-2 data-[state=active]:border-[#1A5514] data-[state=active]:text-[#1A5514]"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="timelines"
                className="flex-1 rounded-none border-b-2 border-transparent px-0 pb-2 data-[state=active]:border-[#1A5514] data-[state=active]:text-[#1A5514]"
              >
                Payout timelines
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6 space-y-6">
              <div>
                <p className="mb-1 text-sm text-gray-500">Amount paid out</p>
                <p className="text-2xl font-bold">{transaction.amount}</p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">
                    Reference number
                  </span>
                  <span className="text-sm font-medium">1325–12423–1290</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">ROM</span>
                  <span className="text-sm font-medium">{transaction.rom}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Recipient</span>
                  <span className="text-sm font-medium">
                    {transaction.recipient}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">
                    Fulfilment center
                  </span>
                  <span className="text-sm font-medium">
                    {transaction.fulfilmentCenter}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Payment date</span>
                  <span className="text-sm font-medium">
                    28 Oct 2025 – 11:53 PM
                  </span>
                </div>
              </div>

              <div className="-mx-6 mb-6 h-[8px] bg-[#F3F7F2]" />
              <div className="pt-0">
                <div className="mb-4 flex items-start justify-between">
                  <h3 className="text-sm font-semibold">
                    Purpose & supporting documents
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 bg-[#E8F3E5] text-xs  font-bold leading-5 text-[#1A5514] hover:bg-[#d9ead6]"
                  >
                    Download
                  </Button>
                </div>

                <div className="mb-4 grid grid-cols-2 gap-4">
                  <span className="text-sm text-gray-500">Purpose</span>
                  <span className="text-sm font-medium">
                    Payment for farming inputs
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-lg  p-3">
                  <div className="flex items-center gap-2">
                    <Checkbox className="mr-2 border-gray-300 data-[state=checked]:border-[#1A5514] data-[state=checked]:bg-[#1A5514]" />
                    <span className="text-sm">Invoice.pdf</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-2 bg-[#E8F3E5] text-sm font-bold leading-5 text-[#1A5514] hover:bg-[#d9ead6]"
                  >
                    <IconEye size={14} />
                    View
                  </Button>
                </div>
              </div>

              <div className="-mx-6 mb-6 h-[8px] bg-[#F3F7F2]" />
              <div className="pt-0">
                <h3 className="mb-4 text-sm font-semibold">Wallet</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">
                      Fulfilment center
                    </span>
                    <span className="text-sm font-medium">
                      {transaction.fulfilmentCenter}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">ROM</span>
                    <span className="text-sm font-medium">
                      {transaction.rom}
                    </span>
                  </div>

                  <Button
                    variant="ghost"
                    className="h-[36px] w-full justify-center gap-2 bg-[#E8F3E5] px-3 py-2 text-sm font-bold leading-5 text-[#1A5514] hover:bg-[#d9ead6]"
                    onClick={
                      () => {
                        // TODO: Implement view wallet
                      }
                      //  () => setIsVersionHistoryOpen(true)
                    }
                  >
                    View wallet
                    <IconChevronRight size={16} />
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="timelines" className="mt-6">
              <div className="relative space-y-8 pl-0">
                {/* Vertical Bar Background */}
                <div className="absolute -top-2 left-0 h-[calc(100%+16px)] w-8 rounded-full bg-[#E5E8DF]/50" />

                <div className="relative flex items-center gap-6">
                  <div className="flex w-8 justify-center">
                    <div className="z-10 h-2.5 w-2.5 rounded-full bg-black" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      Payout processed
                    </h4>
                    <p className="mt-1 text-xs text-gray-500">
                      25 Oct 2025 - 05:00 PM
                    </p>
                  </div>
                </div>

                <div className="relative flex items-center gap-6">
                  <div className="flex w-8 justify-center">
                    <div className="z-10 h-2.5 w-2.5 rounded-full bg-black" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      Payout approved
                    </h4>
                    <p className="mt-1 text-xs text-gray-500">
                      25 Oct 2025 - 05:00 PM | Charles Taylor
                    </p>
                  </div>
                </div>

                <div className="relative flex items-center gap-6">
                  <div className="flex w-8 justify-center">
                    <div className="z-10 h-2.5 w-2.5 rounded-full bg-black" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      Payout created
                    </h4>
                    <p className="mt-1 text-xs text-gray-500">
                      25 Oct 2025 – 04:00 PM | John Doe
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {activeTab === "timelines" && (
          <div className="mt-auto p-6 pt-0">
            <div className="-mx-6 mb-6 h-[8px] bg-[#F3F7F2]" />
            <Button
              className="w-full bg-[#36B92E] font-medium text-white hover:bg-[#2da026]"
              onClick={() => setIsExportDialogOpen(true)}
            >
              Export
            </Button>
          </div>
        )}
      </SheetContent>
      <VersionHistorySheet
        isOpen={isVersionHistoryOpen}
        onClose={() => setIsVersionHistoryOpen(false)}
      />
      <ExportDialog
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
        data={transaction ? [transaction] : []}
        onExportSuccess={() =>
          showSuccessToast("Payout details exported successfully")
        }
      />
    </Sheet>
  );
}
