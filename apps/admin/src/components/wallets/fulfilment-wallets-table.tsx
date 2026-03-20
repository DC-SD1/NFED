"use client";

import { Badge, Button } from "@cf/ui";
import { type ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import React, { useMemo } from "react";

import { DataTableComponent } from "@/components/table/data-table-component";

interface FulfilmentWallet {
  id: string;
  fulfilmentCenter: string;
  representative: string;
  accountNumber: string;
  currency: string;
  walletBalance: string;
  status: "Active" | "Pending" | "Frozen";
}

const SAMPLE_WALLETS: FulfilmentWallet[] = [
  {
    id: "FW-001",
    fulfilmentCenter: "Gaa",
    representative: "John Doe",
    accountNumber: "192031819",
    currency: "GHS",
    walletBalance: "100,000.00",
    status: "Active",
  },
  {
    id: "FW-002",
    fulfilmentCenter: "Gaa",
    representative: "John Doe",
    accountNumber: "192031819",
    currency: "GHS",
    walletBalance: "100,000.00",
    status: "Active",
  },
  {
    id: "FW-003",
    fulfilmentCenter: "Juapong",
    representative: "Kwame Nkrumah",
    accountNumber: "192034819",
    currency: "GHS",
    walletBalance: "100,000.00",
    status: "Active",
  },
  {
    id: "FW-004",
    fulfilmentCenter: "Juapong",
    representative: "John Doe",
    accountNumber: "192034819",
    currency: "GHS",
    walletBalance: "100,000.00",
    status: "Pending",
  },
  {
    id: "FW-005",
    fulfilmentCenter: "Juapong",
    representative: "John Doe",
    accountNumber: "192031865",
    currency: "GHS",
    walletBalance: "100,000.00",
    status: "Pending",
  },
  {
    id: "FW-006",
    fulfilmentCenter: "Juapong",
    representative: "Abena Owusu",
    accountNumber: "192031865",
    currency: "GHS",
    walletBalance: "100,000.00",
    status: "Frozen",
  },
  {
    id: "FW-007",
    fulfilmentCenter: "Juapong",
    representative: "Yaw Osei",
    accountNumber: "192031829",
    currency: "GHS",
    walletBalance: "100,000.00",
    status: "Frozen",
  },
];

export default function FulfilmentWalletsTable({
  searchQuery,
  department,
  currency,
  status,
}: {
  searchQuery: string;
  department: string;
  currency: string;
  status: string;
}) {
  const filteredData = useMemo(() => {
    return SAMPLE_WALLETS.filter((item) => {
      // Search filter
      if (
        searchQuery &&
        !item.fulfilmentCenter
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) &&
        !item.representative.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Department filter
      if (department !== "all" && item.fulfilmentCenter !== department) {
        return false;
      }

      // Currency filter
      if (currency !== "all" && item.currency !== currency) {
        return false;
      }

      // Status filter
      if (
        status !== "all" &&
        item.status.toLowerCase() !== status.toLowerCase()
      ) {
        return false;
      }

      return true;
    });
  }, [searchQuery, department, currency, status]);

  const columns = useMemo<ColumnDef<FulfilmentWallet>[]>(
    () => [
      {
        accessorKey: "fulfilmentCenter",
        header: "Fulfilment center",
        cell: ({ row }) => (
          <span className="text-gray-500">{row.original.fulfilmentCenter}</span>
        ),
      },
      {
        accessorKey: "representative",
        header: "Representative",
        cell: ({ row }) => (
          <span className="font-medium text-gray-900">
            {row.original.representative}
          </span>
        ),
      },
      {
        accessorKey: "accountNumber",
        header: "Account number",
        cell: ({ row }) => (
          <span className="text-gray-500">{row.original.accountNumber}</span>
        ),
      },
      {
        accessorKey: "currency",
        header: "Currency",
        cell: ({ row }) => (
          <span className="text-gray-500">{row.original.currency}</span>
        ),
      },
      {
        accessorKey: "walletBalance",
        header: "Wallet balance",
        cell: ({ row }) => (
          <span className="font-medium text-gray-900">
            {row.original.walletBalance}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.status;
          let className = "";
          let dotColor = "";

          switch (status) {
            case "Pending":
              className =
                "bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-50";
              dotColor = "bg-orange-600";
              break;
            case "Active":
              className =
                "bg-green-50 text-green-600 border-green-200 hover:bg-green-50";
              dotColor = "bg-green-600";
              break;
            case "Frozen":
              className =
                "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-50";
              dotColor = "bg-gray-400"; // Assuming gray for frozen
              break;
          }

          return (
            <Badge variant="outline" className={`font-normal ${className}`}>
              <span
                className={`mr-1.5 h-1.5 w-1.5 rounded-full ${dotColor}`}
              ></span>
              {status}
            </Badge>
          );
        },
      },
      {
        id: "actions",
        cell: () => (
          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500">
            <MoreHorizontal size={16} />
          </Button>
        ),
      },
    ],
    [],
  );

  return (
    <div className="mt-4">
      <DataTableComponent
        columns={columns}
        data={filteredData}
        showRecordSelection={true}
        paginateData={{
          pageIndex: 1,
          pageSize: 10,
          pagination: { pageIndex: 1, pageSize: 10 },
          totalPages: 1,
          currentPage: 1,
        }}
      />
    </div>
  );
}
