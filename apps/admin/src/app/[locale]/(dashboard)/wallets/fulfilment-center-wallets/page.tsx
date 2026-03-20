"use client";

import { Button } from "@cf/ui";
import { IconSend } from "@tabler/icons-react";
import { MoreHorizontal } from "lucide-react";
import React, { useState } from "react";

import AppTitleToolBar from "@/components/layout/app-title-tool-bar";
import FulfilmentStatsCards from "@/components/wallets/fulfilment-stats-cards";
import FulfilmentWalletTabs from "@/components/wallets/fulfilment-wallet-tabs";
import FulfilmentWalletsFilters from "@/components/wallets/fulfilment-wallets-filters";
import FulfilmentWalletsTable from "@/components/wallets/fulfilment-wallets-table";
import { useModal } from "@/lib/stores/use-modal";

export default function FulfilmentCenterWalletsPage() {
  const { onOpen } = useModal();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [department, setDepartment] = useState("all");
  const [currency, setCurrency] = useState("all");

  return (
    <div>
      <AppTitleToolBar
        title="Fulfilment center wallets"
        toolBar={
          <div className="flex items-center gap-2">
            <Button
              onClick={() => onOpen("SendMoney")}
              className="h-9 w-[130px] gap-2 rounded-md bg-[#36B92E] px-3 py-2 text-white hover:bg-[#2da326]"
            >
              <IconSend size={18} />
              Send money
            </Button>
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
      <div className="mt-6 flex flex-col gap-6">
        <FulfilmentStatsCards />

        <div>
          <FulfilmentWalletTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
          {activeTab ? (
            <>
              <FulfilmentWalletsFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                department={department}
                onDepartmentChange={setDepartment}
                currency={currency}
                onCurrencyChange={setCurrency}
              />
              <FulfilmentWalletsTable
                searchQuery={searchQuery}
                department={department}
                currency={currency}
                status={activeTab}
              />
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
