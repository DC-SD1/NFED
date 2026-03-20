"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
} from "@cf/ui";
import { IconChevronDown, IconSearch } from "@tabler/icons-react";
import React from "react";

export default function PaymentsFilters({
  searchQuery,
  onSearchChange,
  amountRange,
  onAmountRangeChange,
  paymentStatus,
  onPaymentStatusChange,
}: {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  amountRange: string;
  onAmountRangeChange: (value: string) => void;
  paymentStatus: string;
  onPaymentStatusChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-4 py-4">
      <div className="relative w-[300px]">
        <IconSearch
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={18}
        />
        <Input
          placeholder="Search by buyer name"
          className="rounded-full border-none bg-[#F3F4F1] pl-10"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-full bg-[#F3F4F1] px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
            {amountRange === "all" ? "Amount range" : amountRange}
            <IconChevronDown size={16} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => onAmountRangeChange("all")}>
            All
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onAmountRangeChange("0-1M")}>
            0 - 1M
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onAmountRangeChange("1M-5M")}>
            1M - 5M
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onAmountRangeChange("5M+")}>
            5M+
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-full bg-[#F3F4F1] px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
            {paymentStatus === "all" ? "Payment status" : paymentStatus}
            <IconChevronDown size={16} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => onPaymentStatusChange("all")}>
            All
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onPaymentStatusChange("New")}>
            New
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onPaymentStatusChange("30% paid")}>
            30% paid
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onPaymentStatusChange("Fully paid")}>
            Fully paid
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
