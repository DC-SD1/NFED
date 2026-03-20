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

export default function FulfilmentWalletsFilters({
  searchQuery,
  onSearchChange,
  department,
  onDepartmentChange,
  currency,
  onCurrencyChange,
}: {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  department: string;
  onDepartmentChange: (value: string) => void;
  currency: string;
  onCurrencyChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-4 py-4">
      <div className="relative w-[340px]">
        <IconSearch
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={18}
        />
        <Input
          placeholder="Search by Fulfilment center, representative, a..."
          className="rounded-full border-none bg-[#F3F4F1] pl-10"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-full bg-[#F3F4F1] px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
            {department === "all" ? "Fulfilment center" : department}
            <IconChevronDown size={16} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => onDepartmentChange("all")}>
            All
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDepartmentChange("Juapong")}>
            Juapong
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDepartmentChange("Gaa")}>
            Gaa
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-full bg-[#F3F4F1] px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
            {currency === "all" ? "Currency" : currency}
            <IconChevronDown size={16} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => onCurrencyChange("all")}>
            All
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onCurrencyChange("GHS")}>
            GHS
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onCurrencyChange("CFA")}>
            CFA
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
