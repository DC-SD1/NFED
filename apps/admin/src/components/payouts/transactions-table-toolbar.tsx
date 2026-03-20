"use client";

import { Input } from "@cf/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@cf/ui/components/select";
import { IconSearch } from "@tabler/icons-react";
import React from "react";

interface TransactionsTableToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filters: {
    fulfilmentCenter: string;
    currency: string;
    amountRange: string;
    date: string;
    status: string;
  };
  onFilterChange: (key: string, value: string) => void;
}

export default function TransactionsTableToolbar({
  searchTerm,
  onSearchChange,
  filters,
  onFilterChange,
}: TransactionsTableToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 py-4">
      <div className="relative w-full sm:w-[250px]">
        <IconSearch
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={18}
        />
        <Input
          placeholder="Search by fulfilment center"
          className="rounded-full border-none bg-[#E8EBE1] pl-10 text-sm font-normal leading-5"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <Select
        value={filters.fulfilmentCenter}
        onValueChange={(value) => onFilterChange("fulfilmentCenter", value)}
      >
        <SelectTrigger className="w-[160px] rounded-full border-none bg-[#E8EBE1] text-sm font-normal leading-5">
          <SelectValue placeholder="Fulfilment center" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Centers</SelectItem>
          <SelectItem value="Accra">Accra</SelectItem>
          <SelectItem value="Kumasi">Kumasi</SelectItem>
          <SelectItem value="Ho">Ho</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={filters.currency}
        onValueChange={(value) => onFilterChange("currency", value)}
      >
        <SelectTrigger className="w-[120px] rounded-full border-none bg-[#E8EBE1] text-sm font-normal leading-5">
          <SelectValue placeholder="Currency" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="GHS">GHS</SelectItem>
          <SelectItem value="USD">USD</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={filters.amountRange}
        onValueChange={(value) => onFilterChange("amountRange", value)}
      >
        <SelectTrigger className="w-[140px] rounded-full border-none bg-[#E8EBE1] text-sm font-normal leading-5">
          <SelectValue placeholder="Amount range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Amounts</SelectItem>
          <SelectItem value="0-1000">0 - 1,000</SelectItem>
          <SelectItem value="1000-5000">1,000 - 5,000</SelectItem>
          <SelectItem value="5000+">5,000+</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={filters.date}
        onValueChange={(value) => onFilterChange("date", value)}
      >
        <SelectTrigger className="w-[100px] rounded-full border-none bg-[#E8EBE1] text-sm font-normal leading-5">
          <SelectValue placeholder="Date" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Any time</SelectItem>
          <SelectItem value="today">Today</SelectItem>
          <SelectItem value="yesterday">Yesterday</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={filters.status}
        onValueChange={(value) => onFilterChange("status", value)}
      >
        <SelectTrigger className="w-[100px] rounded-full border-none bg-[#E8EBE1] text-sm font-normal leading-5">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="Pending">Pending</SelectItem>
          <SelectItem value="Reversed">Reversed</SelectItem>
          <SelectItem value="Failed">Failed</SelectItem>
          <SelectItem value="Successful">Successful</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
