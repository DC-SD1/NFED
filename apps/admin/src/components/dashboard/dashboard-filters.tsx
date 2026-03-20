"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@cf/ui/components/select";
import {
  IconCalendar,
  IconCash,
  IconMap2,
  IconUser,
} from "@tabler/icons-react";
import React from "react";

export default function DashboardFilters() {
  return (
    <div className="flex gap-3 overflow-x-auto">
      {/* Date Range Filter */}
      <Select>
        <SelectTrigger className="h-9 w-auto gap-2 rounded-full border-none bg-[#EDF0E6] px-4 text-sm font-medium text-gray-700 hover:bg-[#e5e7eb]">
          <IconCalendar size={16} className="text-gray-500" />
          <SelectValue placeholder="Date range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="today">Today</SelectItem>
          <SelectItem value="this-week">This Week</SelectItem>
          <SelectItem value="this-month">This Month</SelectItem>
          <SelectItem value="this-year">This Year</SelectItem>
        </SelectContent>
      </Select>

      {/* Currency Filter */}
      <Select>
        <SelectTrigger className="h-9 w-auto gap-2 rounded-full border-none bg-[#EDF0E6] px-4 text-sm font-medium text-gray-700 hover:bg-[#e5e7eb]">
          <IconCash size={16} className="text-gray-500" />
          <SelectValue placeholder="Currency" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ghs">GHS</SelectItem>
          <SelectItem value="usd">USD</SelectItem>
          <SelectItem value="cfa">CFA</SelectItem>
        </SelectContent>
      </Select>

      {/* Fulfilment Center Filter */}
      <Select>
        <SelectTrigger className="h-9 w-auto gap-2 rounded-full border-none bg-[#EDF0E6] px-4 text-sm font-medium text-gray-700 hover:bg-[#e5e7eb]">
          <IconMap2 size={16} className="text-gray-500" />
          <SelectValue placeholder="Fulfilment center" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All centers</SelectItem>
          <SelectItem value="accra">Accra</SelectItem>
          <SelectItem value="kumasi">Kumasi</SelectItem>
        </SelectContent>
      </Select>

      {/* All Users Filter */}
      <Select>
        <SelectTrigger className="h-9 w-auto gap-2 rounded-full border-none bg-[#EDF0E6] px-4 text-sm font-medium text-gray-700 hover:bg-[#e5e7eb]">
          <IconUser size={16} className="text-gray-500" />
          <SelectValue placeholder="All users" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All users</SelectItem>
          <SelectItem value="active">Active users</SelectItem>
          <SelectItem value="inactive">Inactive users</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
