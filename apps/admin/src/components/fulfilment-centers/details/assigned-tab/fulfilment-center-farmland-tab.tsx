"use client";

import React, { useEffect, useMemo, useState } from "react";

import CenterFarmlandTable from "@/components/fulfilment-centers/details/assigned-tab/center-farmland-table";
import CenterFarmlandTableToolbar from "@/components/fulfilment-centers/details/assigned-tab/center-farmland-table-toolbar";
import usePagination from "@/hooks/use-pagingation";
import type { FarmLand } from "@/types/fulfilment-centers.types";

export default function FulfilmentCenterFarmlandTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [growerType, setGrowerType] = useState("all");
  const [farmLands, setFarmLands] = useState<FarmLand[]>([]);
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
      setFarmLands([
        {
          id: "cb586366-406f-4e7d-9c30-ec583d202d7b",
          name: "John Doe",
          growerName: "Bismark Allotey",
          size: "2.5",
          assignedAgent: "James Milner",
          status: "active",
        },
        {
          id: "cb586366-406f-4e7d-2342-ec583d202d7b",
          name: "John Doe",
          growerName: "Bismark Allotey",
          size: "2.5",
          assignedAgent: "James Milner",
          status: "active",
        },
        {
          id: "cb586366-0000-4e7d-9c30-ec583d202d7b",
          name: "John Doe",
          growerName: "Bismark Allotey",
          size: "2.5",
          assignedAgent: "James Milner",
          status: "active",
        },
      ]);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={"flex flex-col gap-4"}>
      <div className={"mt-8"}>
        <CenterFarmlandTable
          data={farmLands}
          paginateData={{
            pageIndex,
            pagination,
            pageSize,
            currentPage: 1,
            totalPages: 1,
            setPagination,
          }}
          toolBar={
            <CenterFarmlandTableToolbar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              growerType={growerType}
              setGrowerType={setGrowerType}
              selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
            />
          }
        />
      </div>
    </div>
  );
}
