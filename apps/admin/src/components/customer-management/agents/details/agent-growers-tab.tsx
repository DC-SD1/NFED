"use client";

import { IconLoader } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import React, { useEffect, useMemo, useState } from "react";

import AgentFarmersTable from "@/components/customer-management/agents/details/agent-farmers-table";
import AgentFarmersTableToolbar from "@/components/customer-management/agents/details/agent-farmers-table-toolbar";
import AgentOverviewDoubleCard from "@/components/customer-management/agents/details/agent-overview-double-card";
import DateRangePicker from "@/components/input-components/date-range-picker";
import usePagination from "@/hooks/use-pagingation";
import type { AgentFarmer } from "@/types/agent.types";
import { UsersAlternative } from "@/utils/svg-icons";

export default function AgentGrowersTab() {
  const t = useTranslations("customerManagement.agents.details.farmersTab");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFulfillmentCenter, setSelectedFulfillmentCenter] =
    useState("all");
  const [growerType, setGrowerType] = useState("all");
  const [agentFarmers, setAgentFarmers] = useState<AgentFarmer[]>([]);
  const [{ pageIndex, pageSize }, setPagination] = usePagination({
    pageIndex: 1,
    pageSize: 10,
  });

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setAgentFarmers([
        {
          id: "cb586366-406f-4e7d-9c30-ec583d202d7b",
          name: "John Doe",
          growerType: "Smallholder",
          farm: "2.5",
          fulfilmentCenter: "Juapong fulfilment center",
          status: "active",
        },
        {
          id: "03486366-406f-4e7d-9c30-s9d83d202d7b",
          name: "John Doe",
          growerType: "Formal",
          farm: "20",
          fulfilmentCenter: "Juapong fulfilment center",
          status: "active",
        },
        {
          id: "cb586366-406f-4e7d-9c30-ec585dw02d7b",
          name: "John Doe",
          growerType: "Formal",
          farm: "24",
          fulfilmentCenter: "Juapong fulfilment center",
          status: "inactive",
        },
      ]);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={"flex flex-col gap-4"}>
      <div>
        <DateRangePicker
          className="rounded-full"
          triggerClassName="w-auto"
          placeholder={t("dateRange")}
        />
      </div>
      <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
        <div className={"col-span-1"}>
          <AgentOverviewDoubleCard
            title={t("linkedFarmers")}
            stats={[
              {
                status: t("smallholder"),
                amount: "124",
              },
              {
                status: t("formal"),
                amount: "10",
              },
            ]}
            icon={<UsersAlternative size={"16"} fill={"#36B92E"} />}
            iconContainerClassName={"bg-[#EBF3E3]"}
          />
        </div>
        <div className={"col-span-1"}>
          <AgentOverviewDoubleCard
            title={t("status")}
            stats={[
              {
                status: t("active"),
                amount: "124",
                valueClassName: "text-primary",
              },
              {
                status: t("inactive"),
                amount: "10",
                valueClassName: "text-[#BA1A1A]",
              },
            ]}
            icon={<IconLoader className={"size-4 text-[#9C46F1]"} />}
            iconContainerClassName={"bg-[#E2D1FD]"}
          />
        </div>
      </div>

      <div className={"mt-8"}>
        <AgentFarmersTable
          data={agentFarmers}
          paginateData={{
            pageIndex,
            pagination,
            pageSize,
            currentPage: 1,
            totalPages: 1,
            setPagination,
          }}
          toolBar={
            <AgentFarmersTableToolbar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              growerType={growerType}
              setGrowerType={setGrowerType}
              selectedFulfillmentCenter={selectedFulfillmentCenter}
              setSelectedFulfillmentCenter={setSelectedFulfillmentCenter}
            />
          }
        />
      </div>
    </div>
  );
}
