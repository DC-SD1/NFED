"use client";

import { Card, CardContent } from "@cf/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@cf/ui/components/select";
import React from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { name: "JAN", inflows: 20000, outflows: 10000 },
  { name: "FEB", inflows: 35000, outflows: 25000 },
  { name: "MAR", inflows: 22000, outflows: 15000 },
  { name: "APR", inflows: 45000, outflows: 20000 },
  { name: "MAY", inflows: 28000, outflows: 35000 },
  { name: "JUN", inflows: 38000, outflows: 22000 },
  { name: "JUL", inflows: 25000, outflows: 30000 },
  { name: "AUG", inflows: 42000, outflows: 38000 },
  { name: "SEP", inflows: 30000, outflows: 40000 },
  { name: "OCT", inflows: 38000, outflows: 28000 },
  { name: "NOV", inflows: 32000, outflows: 25000 },
  { name: "DEC", inflows: 35000, outflows: 30000 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="rounded-lg border border-gray-100 bg-white p-3 shadow-lg">
        <p className="mb-2 text-sm font-bold text-gray-900">{label}</p>
        <div className="flex flex-col gap-1">
          {payload.map((entry: any, index: number) => (
            <div
              key={index}
              className="flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-2">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-xs capitalize text-gray-500">
                  {entry.name}
                </span>
              </div>
              <span className="text-xs font-medium text-gray-900">
                GHS {entry.value.toLocaleString()}.00
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function TransactionsChartSection() {
  return (
    <Card className="rounded-xl border bg-white shadow-sm">
      <CardContent className="p-6">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div className="flex items-center gap-4">
              <h3 className="border-r pr-2 text-lg font-bold text-gray-900">
                Transactions
              </h3>
              <Select defaultValue="this-month">
                <SelectTrigger className="h-8 w-auto gap-2 border-none bg-transparent px-0 text-sm font-medium text-gray-900 hover:bg-transparent focus:ring-0">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="this-month">This month</SelectItem>
                  <SelectItem value="last-month">Last month</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap gap-8">
              <div>
                <p className="text-xs text-gray-500">Total transactions</p>
                <div className="flex items-baseline gap-2">
                  <h4 className="text-lg font-bold text-gray-900">
                    GHS 200,000.00
                  </h4>
                </div>
                <p className="text-xs text-gray-400">Count 165</p>
              </div>
              <div className="border-l border-gray-200 pl-8">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <p className="text-xs text-gray-500">Inflows</p>
                </div>
                <div className="flex items-baseline gap-2">
                  <h4 className="text-lg font-bold text-gray-900">
                    GHS 120,000.00
                  </h4>
                </div>
                <p className="text-xs text-gray-400">Count 90</p>
              </div>
              <div className="border-l border-gray-200 pl-8">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  <p className="text-xs text-gray-500">Outflows</p>
                </div>
                <div className="flex items-baseline gap-2">
                  <h4 className="text-lg font-bold text-gray-900">
                    GHS 80,000.00
                  </h4>
                </div>
                <p className="text-xs text-gray-400">Count 180</p>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid
                  vertical={false}
                  stroke="#F2F4EF"
                  strokeDasharray="3 3"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#9CA3AF" }}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ stroke: "#22C55E", strokeDasharray: "3 3" }}
                />
                <Line
                  type="monotone"
                  dataKey="inflows"
                  stroke="#22C55E"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{
                    r: 4,
                    fill: "#22C55E",
                    stroke: "#fff",
                    strokeWidth: 2,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="outflows"
                  stroke="#EF4444"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{
                    r: 4,
                    fill: "#EF4444",
                    stroke: "#fff",
                    strokeWidth: 2,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
