"use client";

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@cf/ui";
import { IconSend } from "@tabler/icons-react";
import { ChevronDown, MoreHorizontal, PlusCircle } from "lucide-react";
import React from "react";

import AppTitleToolBar from "@/components/layout/app-title-tool-bar";
import FinanceStatsCards from "@/components/wallets/finance-stats-cards";
import FinanceTransactionsTable from "@/components/wallets/finance-transactions-table";
import { useModal } from "@/lib/stores/use-modal";

export default function FinanceAdminWalletPage() {
  const { onOpen } = useModal();
  return (
    <div>
      <AppTitleToolBar
        title="Finance admin wallet"
        toolBar={
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-md bg-[#36B92E] text-white hover:bg-[#2da326]">
              <Button
                onClick={() => onOpen("SendMoney")}
                className="flex h-9 items-center gap-2 rounded-l-md rounded-r-none border-r border-[#2da326] bg-transparent pl-3 pr-2 text-white hover:bg-transparent"
              >
                <IconSend size={18} />
                Send money
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="h-9 rounded-l-none rounded-r-md bg-transparent px-2 text-white hover:bg-transparent">
                    <ChevronDown size={18} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[175px] p-0">
                  <DropdownMenuItem
                    onClick={() => onOpen("SelectFulfilmentCenter")}
                    className="flex h-[56px] w-full cursor-pointer items-center justify-start gap-4 px-4 py-0"
                  >
                    <PlusCircle size={20} className="text-black" />
                    <span className="text-base font-medium">Create wallet</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="border-dashed border-gray-300"
            >
              <MoreHorizontal className="text-gray-500" />
            </Button>
          </div>
        }
      />
      <div className="mt-6">
        <FinanceStatsCards />
        <FinanceTransactionsTable />
      </div>
    </div>
  );
}
