"use client";

import React, { useEffect, useMemo, useState } from "react";

import CenterManagerTable from "@/components/fulfilment-centers/details/assigned-tab/center-manager-table";
import CenterManagerTableToolbar from "@/components/fulfilment-centers/details/assigned-tab/center-manager-table-toolbar";
import usePagination from "@/hooks/use-pagingation";
import type { CenterManager } from "@/types/fulfilment-centers.types";

export default function FulfilmentCenterManagerTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [agents, setAgents] = useState<CenterManager[]>([]);
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
          assignedRole: "Warehouse Manager",
          status: "active",
        },
        {
          id: "cb586366-406f-4e7d-2342-ec583d202d7b",
          name: "John Doe",
          assignedRole: "Regional Manager",
          status: "active",
        },
        {
          id: "cb586366-0000-4e7d-9c30-ec583d202d7b",
          name: "John Doe",
          assignedRole: "Regional Manager",
          status: "deactivated",
        },
      ]);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={"flex flex-col gap-4"}>
      <div className={"mt-8"}>
        <CenterManagerTable
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
            <CenterManagerTableToolbar
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
