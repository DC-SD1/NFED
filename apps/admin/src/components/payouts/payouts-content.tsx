"use client";

import React, { useEffect, useState } from "react";

import PayoutsHeader from "./payouts-header";
import PayoutsStats from "./payouts-stats";
import type { Transaction } from "./transactions-table";
import TransactionsTable from "./transactions-table";

const mockData: Transaction[] = [
  {
    id: "1",
    payoutId: "PO-001",
    fulfilmentCenter: "Accra",
    rom: "Annette Black",
    recipient: "Jenny Wilson",
    amount: "GHS 100,000.00",
    status: "Pending",
    date: new Date().toISOString(), // Today
  },
  {
    id: "2",
    payoutId: "PO-002",
    fulfilmentCenter: "Accra",
    rom: "Marvin McKinney",
    recipient: "Jane Cooper",
    amount: "GHS 100,000.00",
    status: "Pending",
    date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
  },
  {
    id: "3",
    payoutId: "PO-003",
    fulfilmentCenter: "Accra",
    rom: "Cody Fisher",
    recipient: "Eleanor Pena",
    amount: "GHS 100,000.00",
    status: "Reversed",
    date: "2023-10-25T10:00:00Z",
  },
  {
    id: "4",
    payoutId: "PO-004",
    fulfilmentCenter: "Kumasi",
    rom: "Robert Fox",
    recipient: "Brooklyn Simmons",
    amount: "GHS 100,000.00",
    status: "Failed",
    date: "2023-10-20T14:30:00Z",
  },
  {
    id: "5",
    payoutId: "PO-005",
    fulfilmentCenter: "Ho",
    rom: "Kristin Watson",
    recipient: "Dianne Russell",
    amount: "GHS 75,450.00",
    status: "Reversed",
    date: "2023-10-15T09:15:00Z",
  },
  {
    id: "6",
    payoutId: "PO-006",
    fulfilmentCenter: "Kumasi",
    rom: "Esther Howard",
    recipient: "Arlene McCoy",
    amount: "USD 5,000.00",
    status: "Successful",
    date: new Date().toISOString(),
  },
];

export interface FilterState {
  fulfilmentCenter: string;
  currency: string;
  amountRange: string;
  date: string;
  status: string;
}

export default function PayoutsContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("all-time");

  // Filtering State
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    fulfilmentCenter: "",
    currency: "",
    amountRange: "",
    date: "",
    status: "",
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value === "all" ? "" : value }));
  };

  const filterByTimeframe = (item: Transaction) => {
    const itemDate = new Date(item.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (timeframe) {
      case "today":
        return itemDate >= today;
      case "this-week": {
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        return itemDate >= startOfWeek;
      }
      case "this-month": {
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        return itemDate >= startOfMonth;
      }
      case "no-data":
        return false;
      case "all-time":
      default:
        return true;
    }
  };

  // Filter Logic
  const filteredData = mockData.filter((item) => {
    // Timeframe Filter
    if (!filterByTimeframe(item)) return false;

    // Search Filter
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      item.fulfilmentCenter.toLowerCase().includes(searchLower) ||
      item.payoutId.toLowerCase().includes(searchLower) ||
      item.recipient.toLowerCase().includes(searchLower) ||
      item.rom.toLowerCase().includes(searchLower);

    if (!matchesSearch) return false;

    // Dropdown Filters
    if (
      filters.fulfilmentCenter &&
      item.fulfilmentCenter !== filters.fulfilmentCenter
    )
      return false;

    if (filters.currency) {
      const currency = item.amount.split(" ")[0];
      if (currency !== filters.currency) return false;
    }

    if (filters.amountRange) {
      const amountValue = parseFloat(item.amount.replace(/[^0-9.]/g, ""));
      if (filters.amountRange === "0-1000") {
        if (amountValue > 1000) return false;
      } else if (filters.amountRange === "1000-5000") {
        if (amountValue < 1000 || amountValue > 5000) return false;
      } else if (filters.amountRange === "5000+") {
        if (amountValue < 5000) return false;
      }
    }

    if (filters.date) {
      const itemDate = new Date(item.date);
      const today = new Date();
      if (filters.date === "today") {
        if (itemDate.toDateString() !== today.toDateString()) return false;
      } else if (filters.date === "yesterday") {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        if (itemDate.toDateString() !== yesterday.toDateString()) return false;
      }
    }

    if (filters.status && item.status !== filters.status) return false;

    return true;
  });

  return (
    <div className="flex flex-col gap-8 p-6">
      <PayoutsHeader
        data={filteredData}
        timeframe={timeframe}
        setTimeframe={setTimeframe}
      />
      <PayoutsStats timeframe={timeframe} setTimeframe={setTimeframe} />
      <TransactionsTable
        data={filteredData}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filters={filters}
        onFilterChange={handleFilterChange}
        isLoading={isLoading}
        isNoDataMode={timeframe === "no-data"}
      />
    </div>
  );
}
