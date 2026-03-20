"use client";

import { Card, CardContent, CardDescription } from "@cf/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@cf/ui/components/select";
import React from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

// Data for Fund Request Status
const fundRequestStatusData = [
  { name: "Pending", value: 10, color: "#FBBF24" }, // yellow-400
  { name: "Approved", value: 100, color: "#22C55E" }, // green-500
  { name: "Rejected", value: 20, color: "#EF4444" }, // red-500
];

// Data for Fund Utilization
const fundUtilizationData = [
  { name: "Allocated", value: 20000, color: "#22C55E" }, // green-500
  { name: "Spent", value: 40000, color: "#B91C1C" }, // red-700
];

// Data for Funding Sources
const fundingSourcesData = [
  { name: "Platform Fund", value: 80000, color: "#064E3B" }, // emerald-900
  { name: "Finance Admin", value: 100000, color: "#22C55E" }, // green-500
  { name: "Buyer Payment", value: 20000, color: "#86EFAC" }, // green-300
];

// Data for Funding Destinations
const fundingDestinationsData = [
  { name: "Agent", value: 20000, color: "#BBF7D0" }, // green-200
  { name: "Grower", value: 80000, color: "#22C55E" }, // green-500
  { name: "Mobile number", value: 70000, color: "#064E3B" }, // emerald-900
];

interface ChartCardProps {
  title: string;
  data: { name: string; value: number; color: string }[];
  innerRadius?: number;
  outerRadius?: number;
}

const ChartCard = ({
  title,
  data,
  innerRadius = 60,
  outerRadius = 80,
}: ChartCardProps) => {
  return (
    <Card className="rounded-xl border bg-white shadow-sm">
      <div className="mb-6 flex items-center border-b p-4">
        <h3 className="border-r pr-2 text-sm font-bold text-gray-900">
          {title}
        </h3>
        <div className="pr-4" />
        <Select defaultValue="ghs">
          <SelectTrigger className="h-8 w-auto gap-2 border-none bg-transparent px-0 text-xs font-bold text-gray-900 hover:bg-transparent focus:ring-0">
            <SelectValue placeholder="Currency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ghs">GHS</SelectItem>
            <SelectItem value="usd">USD</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <CardDescription className="sr-only">
        {title} chart
      </CardDescription>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="h-[160px] w-[160px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={innerRadius}
                  outerRadius={outerRadius}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-col gap-4">
            {data.map((entry, index) => (
              <div key={index} className="flex items-start gap-2">
                <div
                  className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <div>
                  <p className="text-xs text-gray-500">{entry.name}</p>
                  <p className="text-sm font-bold text-gray-900">
                    {title.includes("status")
                      ? entry.value
                      : `GHS ${entry.value.toLocaleString()}.00`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function DashboardChartsGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <ChartCard title="Fund request status" data={fundRequestStatusData} />
      <ChartCard title="Fund utilization" data={fundUtilizationData} />
      <ChartCard title="Funding sources" data={fundingSourcesData} />
      <ChartCard title="Funding destinations" data={fundingDestinationsData} />
    </div>
  );
}
