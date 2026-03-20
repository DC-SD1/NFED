"use client";

import { Badge, Button } from "@cf/ui";
import { type ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Search } from "lucide-react";
import { parseAsString, useQueryStates } from "nuqs";
import React, { useMemo } from "react";

import DropdownComponent from "@/components/input-components/dropdown-component";
import InputComponent from "@/components/input-components/input-component";
import { DataTableComponent } from "@/components/table/data-table-component";
import { useDebounce } from "@/hooks/use-debounce";

interface Transaction {
  id: string;
  recipient: string;
  recipientType: string;
  currency: string;
  amount: string;
  datePaid: string;
  status: "Pending" | "Disbursed" | "Failed";
}

const SAMPLE_TRANSACTIONS: Transaction[] = [
  {
    id: "TR-001",
    recipient: "Devon Lane",
    recipientType: "Mobile money",
    currency: "GHS",
    amount: "100,000.00",
    datePaid: "20 Nov 2025",
    status: "Pending",
  },
  {
    id: "TR-002",
    recipient: "Theresa Webb",
    recipientType: "Mobile money",
    currency: "GHS",
    amount: "100,000.00",
    datePaid: "20 Nov 2025",
    status: "Disbursed",
  },
  {
    id: "TR-003",
    recipient: "Courtney Henry",
    recipientType: "Grower",
    currency: "GHS",
    amount: "100,000.00",
    datePaid: "20 Nov 2025",
    status: "Pending",
  },
  {
    id: "TR-004",
    recipient: "Eleanor Pena",
    recipientType: "Grower",
    currency: "GHS",
    amount: "100,000.00",
    datePaid: "20 Nov 2025",
    status: "Failed",
  },
  {
    id: "TR-005",
    recipient: "Leslie Alexander",
    recipientType: "Mobile money",
    currency: "GHS",
    amount: "100,000.00",
    datePaid: "20 Nov 2025",
    status: "Pending",
  },
];

export default function FinanceTransactionsTable() {
  const [filters, setFilters] = useQueryStates({
    search: parseAsString.withDefault(""),
    recipientType: parseAsString.withDefault("all"),
    currency: parseAsString.withDefault("all"),
    status: parseAsString.withDefault("all"),
    amountRange: parseAsString.withDefault("all"),
    datePaid: parseAsString.withDefault("all"),
  });

  const debouncedSearch = useDebounce(filters.search);

  const filteredData = useMemo(() => {
    return SAMPLE_TRANSACTIONS.filter((item) => {
      // Search filter
      if (
        debouncedSearch &&
        !item.recipient.toLowerCase().includes(debouncedSearch.toLowerCase()) &&
        !item.id.toLowerCase().includes(debouncedSearch.toLowerCase())
      ) {
        return false;
      }

      // Recipient type filter
      if (
        filters.recipientType !== "all" &&
        item.recipientType !== filters.recipientType
      ) {
        return false;
      }

      // Currency filter
      if (filters.currency !== "all" && item.currency !== filters.currency) {
        return false;
      }

      // Status filter
      if (filters.status !== "all" && item.status !== filters.status) {
        return false;
      }

      return true;
    });
  }, [filters, debouncedSearch]);

  const columns = useMemo<ColumnDef<Transaction>[]>(
    () => [
      {
        accessorKey: "id",
        header: "Transfer ID",
        cell: ({ row }) => (
          <span className="text-gray-500">{row.original.id}</span>
        ),
      },
      {
        accessorKey: "recipient",
        header: "Recipient",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">
              {row.original.recipient}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "recipientType",
        header: "Recipient type",
        cell: ({ row }) => (
          <span className="text-gray-500">{row.original.recipientType}</span>
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
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => (
          <span className="font-medium text-gray-900">
            {row.original.amount}
          </span>
        ),
      },
      {
        accessorKey: "datePaid",
        header: "Date paid",
        cell: ({ row }) => (
          <span className="text-gray-500">{row.original.datePaid}</span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.status;
          let className = "";

          switch (status) {
            case "Pending":
              className =
                "bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-50";
              break;
            case "Disbursed":
              className =
                "bg-green-50 text-green-600 border-green-200 hover:bg-green-50";
              break;
            case "Failed":
              className =
                "bg-red-50 text-red-600 border-red-200 hover:bg-red-50";
              break;
          }

          return (
            <Badge variant="outline" className={`font-normal ${className}`}>
              <span
                className={`mr-1.5 h-1.5 w-1.5 rounded-full ${status === "Pending" ? "bg-orange-600" : status === "Disbursed" ? "bg-green-600" : "bg-red-600"}`}
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
    <div className="mt-8">
      <h3 className="mb-4 text-lg font-bold text-gray-900">
        Transaction history
      </h3>

      <DataTableComponent
        columns={columns}
        data={filteredData}
        showRecordSelection={true}
        toolBar={
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-[320px]">
              <InputComponent
                type="search"
                placeholder="Search by Fulfilment center, wallet name..."
                value={filters.search}
                onChange={(e) => setFilters({ search: e.target.value })}
                className="rounded-full border-none bg-gray-100"
                left={<Search className="h-4 w-4 text-gray-500" />}
              />
            </div>

            <div className="w-[180px]">
              <DropdownComponent
                placeholder="Recipient type"
                className="rounded-full border-none bg-gray-100"
                options={[
                  { value: "all", label: "All" },
                  { value: "Mobile money", label: "Mobile money" },
                  { value: "Grower", label: "Grower" },
                ]}
                value={
                  filters.recipientType === "all" ? "" : filters.recipientType
                }
                onValueChange={(val) => setFilters({ recipientType: val })}
              />
            </div>

            <div className="w-[120px]">
              <DropdownComponent
                placeholder="Currency"
                className="rounded-full border-none bg-gray-100"
                options={[
                  { value: "all", label: "All" },
                  { value: "GHS", label: "GHS" },
                ]}
                value={filters.currency === "all" ? "" : filters.currency}
                onValueChange={(val) => setFilters({ currency: val })}
              />
            </div>

            <div className="w-[140px]">
              <DropdownComponent
                placeholder="Status"
                className="rounded-full border-none bg-gray-100"
                options={[
                  { value: "all", label: "All" },
                  { value: "Pending", label: "Pending" },
                  { value: "Disbursed", label: "Disbursed" },
                  { value: "Failed", label: "Failed" },
                ]}
                value={filters.status === "all" ? "" : filters.status}
                onValueChange={(val) => setFilters({ status: val })}
              />
            </div>

            <div className="w-[160px]">
              <DropdownComponent
                placeholder="Amount range"
                className="rounded-full border-none bg-gray-100"
                options={[{ value: "all", label: "All" }]}
                value={filters.amountRange === "all" ? "" : filters.amountRange}
                onValueChange={(val) => setFilters({ amountRange: val })}
              />
            </div>

            <div className="w-[140px]">
              <DropdownComponent
                placeholder="Date paid"
                className="rounded-full border-none bg-gray-100"
                options={[{ value: "all", label: "All" }]}
                value={filters.datePaid === "all" ? "" : filters.datePaid}
                onValueChange={(val) => setFilters({ datePaid: val })}
              />
            </div>
          </div>
        }
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
