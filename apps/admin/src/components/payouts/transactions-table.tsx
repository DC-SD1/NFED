"use client";

import { Badge, Checkbox } from "@cf/ui";
import {
  IconCircleX,
  IconDotsVertical,
  IconLoader,
} from "@tabler/icons-react";
import type { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import React, { useState } from "react";

import { DataTableComponent } from "@/components/table/data-table-component";
import { ImageAssets } from "@/utils/image-assets";

import PayoutDetailsSheet from "./payout-details-sheet";
import TransactionsTableToolbar from "./transactions-table-toolbar";

export interface Transaction {
  id: string;
  payoutId: string;
  fulfilmentCenter: string;
  rom: string;
  recipient: string;
  amount: string;
  status: "Pending" | "Reversed" | "Failed" | "Successful";
  date: string; // ISO string for filtering
}

export interface FilterState {
  fulfilmentCenter: string;
  currency: string;
  amountRange: string;
  date: string;
  status: string;
}

interface TransactionsTableProps {
  data: Transaction[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filters: FilterState;
  onFilterChange: (key: string, value: string) => void;
  isLoading: boolean;
  isNoDataMode?: boolean;
}

export default function TransactionsTable({
  data,
  searchTerm,
  onSearchChange,
  filters,
  onFilterChange,
  isLoading,
  isNoDataMode = false,
}: TransactionsTableProps) {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleRowClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsSheetOpen(true);
  };

  const columns: ColumnDef<Transaction>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          className={"border-[#E5E8DF] bg-white"}
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          className={"border-[#E5E8DF] bg-white"}
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "payoutId",
      header: "Payout ID",
    },
    {
      accessorKey: "fulfilmentCenter",
      header: "Fulfilment center",
    },
    {
      accessorKey: "rom",
      header: "ROM",
    },
    {
      accessorKey: "recipient",
      header: "Recipient",
    },
    {
      accessorKey: "amount",
      header: "Amount",
    },
    {
      accessorKey: "status",
      header: "Payout status",
      cell: ({ row }) => {
        const status = row.original.status;
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
          case "Successful":
            colorClass = "text-green-600 border-green-200";
            icon = <div className="h-2 w-2 rounded-full bg-green-600" />;
            break;
        }

        return (
          <Badge
            variant="outline"
            className={`flex w-fit items-center gap-1 rounded-md px-2 py-1 text-xs font-medium ${colorClass}`}
          >
            {icon}
            {status}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: () => (
        <div className="flex justify-end">
          <button className="text-gray-500 hover:text-gray-700">
            <IconDotsVertical size={18} />
          </button>
        </div>
      ),
    },
  ];

  // Check if any filters are active
  const hasActiveFilters =
    searchTerm !== "" ||
    filters.fulfilmentCenter !== "" ||
    filters.currency !== "" ||
    filters.amountRange !== "" ||
    filters.date !== "" ||
    filters.status !== "";

  return (
    <div className="space-y-0">
      <h2 className="text-[20px] font-bold">Transactions</h2>
      <DataTableComponent
        toolBar={
          <TransactionsTableToolbar
            searchTerm={searchTerm}
            onSearchChange={onSearchChange}
            filters={filters}
            onFilterChange={onFilterChange}
          />
        }
        columns={columns}
        data={data}
        paginateData={{
          pageIndex: pagination.pageIndex + 1,
          pageSize: pagination.pageSize,
          currentPage: 1,
          totalPages: 1,
          pagination: {
            pageIndex: pagination.pageIndex + 1,
            pageSize: pagination.pageSize,
          },
          setPagination: setPagination,
        }}
        showRecordSelection={true}
        emptyStateTitle="No payouts available"
        emptyStateMessage="All payout requests will be displayed when available"
        emptyStateImgSrc={ImageAssets.PAYOUTS_EMPTY_ICON.src}
        hasEmptyStateImage={true}
        isLoading={isLoading}
        hideHeaderOnEmpty={isNoDataMode}
        hideEmptyState={!isNoDataMode && hasActiveFilters}
        hidePaginationOnEmpty={true}
        onRowClick={handleRowClick}
      />

      <PayoutDetailsSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        transaction={selectedTransaction}
      />
    </div>
  );
}
