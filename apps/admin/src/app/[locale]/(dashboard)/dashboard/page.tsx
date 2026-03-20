import { Button } from "@cf/ui";
import { IconDots } from "@tabler/icons-react";
import React from "react";

import DashboardChartsGrid from "@/components/dashboard/dashboard-charts-grid";
import DashboardExportAction from "@/components/dashboard/dashboard-export-action";
import DashboardFilters from "@/components/dashboard/dashboard-filters";
import OperationsOverviewSection from "@/components/dashboard/dashboard-operations-overview";
import DashboardStatsCards from "@/components/dashboard/dashboard-stats-cards";
import TopActiveWallets from "@/components/dashboard/top-active-wallets";
import TransactionsChartSection from "@/components/dashboard/transactions-chart-section";
import WalletBalanceSection from "@/components/dashboard/wallet-balance-section";
import AppTitleToolBar from "@/components/layout/app-title-tool-bar";

export default async function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 px-2 lg:px-8 lg:pb-8">
      <AppTitleToolBar
        title={"Dashboard"}
        toolBar={
          <div className="flex items-center gap-2">
            <DashboardExportAction />
            <Button
              variant="outline"
              size="icon"
              className="w-10 border-none bg-[#F3F4F1] px-0 text-gray-700 hover:bg-[#e5e7eb]"
            >
              <IconDots size={18} />
            </Button>
          </div>
        }
      />

      <DashboardFilters />

      <WalletBalanceSection />

      <DashboardStatsCards />

      <OperationsOverviewSection />

      <TransactionsChartSection />

      <DashboardChartsGrid />

      <TopActiveWallets />
    </div>
  );
}
