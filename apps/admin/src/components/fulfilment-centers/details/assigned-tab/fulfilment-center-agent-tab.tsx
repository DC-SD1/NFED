"use client";

import React, { useEffect, useMemo, useState } from "react";

import CenterAgentTable from "@/components/fulfilment-centers/details/assigned-tab/center-agent-table";
import CenterAgentTableToolbar from "@/components/fulfilment-centers/details/assigned-tab/center-agent-table-toolbar";
import usePagination from "@/hooks/use-pagingation";
import type { CenterAgent } from "@/types/fulfilment-centers.types";

export default function FulfilmentCenterAgentTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [agents, setAgents] = useState<CenterAgent[]>([]);
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
      setAgents([
        {
          id: "cb586366-406f-4e7d-9c30-ec583d202d7b",
          name: "John Doe",
          size: "450 ac",
          noGrowersAssigned: 150,
          status: "active",
        },
        {
          id: "cb586366-406f-4e7d-2342-ec583d202d7b",
          name: "John Doe",
          size: "450 ac",
          noGrowersAssigned: 150,
          status: "active",
        },
        {
          id: "cb586366-0000-4e7d-9c30-ec583d202d7b",
          name: "John Doe",
          size: "450 ac",
          noGrowersAssigned: 150,
          status: "active",
        },
      ]);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={"flex flex-col gap-4"}>
      <div className={"mt-8"}>
        <CenterAgentTable
          data={agents}
          paginateData={{
            pageIndex,
            pagination,
            pageSize,
            currentPage: 1,
            totalPages: 1,
            setPagination,
          }}
          toolBar={
            <CenterAgentTableToolbar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
            />
          }
        />
      </div>
    </div>
  );
}
