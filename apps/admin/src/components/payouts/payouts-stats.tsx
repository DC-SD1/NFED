"use client";

import { Card, CardContent } from "@cf/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@cf/ui/components/select";
import { IconChartPie, IconClock } from "@tabler/icons-react";
import React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";

// Mock Data for different timeframes
const dataToday = [
  { name: "00:00", value: 120, amount: "USD 1.2K" },
  { name: "04:00", value: 300, amount: "USD 3.0K" },
  { name: "08:00", value: 800, amount: "USD 8.0K" },
  { name: "12:00", value: 1500, amount: "USD 15.0K" },
  { name: "16:00", value: 1100, amount: "USD 11.0K" },
  { name: "20:00", value: 600, amount: "USD 6.0K" },
  { name: "23:59", value: 200, amount: "USD 2.0K" },
];

const dataWeek = [
  { name: "Mon", value: 2000, amount: "USD 20.0K" },
  { name: "Tue", value: 3500, amount: "USD 35.0K" },
  { name: "Wed", value: 2200, amount: "USD 22.0K" },
  { name: "Thu", value: 4500, amount: "USD 45.0K" },
  { name: "Fri", value: 2800, amount: "USD 28.0K" },
  { name: "Sat", value: 3800, amount: "USD 38.0K" },
  { name: "Sun", value: 2500, amount: "USD 25.0K" },
];

const dataMonth = [
  { name: "Week 1", value: 12000, amount: "USD 120K" },
  { name: "Week 2", value: 15000, amount: "USD 150K" },
  { name: "Week 3", value: 11000, amount: "USD 110K" },
  { name: "Week 4", value: 18000, amount: "USD 180K" },
];

const dataAllTime = [
  { name: "Jan", value: 2000, amount: "USD 2.4M" },
  { name: "Feb", value: 3500, amount: "USD 3.5M" },
  { name: "Mar", value: 2200, amount: "USD 2.2M" },
  { name: "Apr", value: 4500, amount: "USD 4.5M" },
  { name: "May", value: 2800, amount: "USD 2.8M" },
  { name: "Jun", value: 3800, amount: "USD 3.8M" },
  { name: "Jul", value: 2500, amount: "USD 2.5M" },
  { name: "Aug", value: 4200, amount: "USD 4.2M" },
  { name: "Sep", value: 3000, amount: "USD 3.0M" },
  { name: "Oct", value: 3800, amount: "USD 3.8M" },
  { name: "Nov", value: 3200, amount: "USD 3.2M" },
  { name: "Dec", value: 3500, amount: "USD 3.5M" },
];



const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="min-w-[150px] rounded-lg border border-gray-100 bg-white p-3 shadow-lg">
        <p className="mb-2 text-sm font-bold text-gray-900">{label}</p>
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-gray-500">Volume</span>
            <span className="text-xs font-medium text-gray-900">
              {payload[0].value.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-gray-500">Amount</span>
            <span className="text-xs font-medium text-gray-900">
              {payload[0].payload.amount}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

interface PayoutsStatsProps {
  timeframe: string;
  setTimeframe: (value: string) => void;
}

export default function PayoutsStats({
  timeframe,
  setTimeframe,
}: PayoutsStatsProps) {
  const getData = () => {
    switch (timeframe) {
      case "today":
        return {
          data: dataToday,
          volume: "4,620",
          value: "$ 45,200.00",
          successfulAmount: "GHS 4,000.00",
          successfulCount: "20 payouts",
          failedAmount: "GHS 1,000.00",
          failedCount: "5 payouts",
          statusData: [
            { name: "Successful", value: 20, color: "#22C55E" },
            { name: "Failed", value: 5, color: "#EF4444" },
          ],
        };
      case "this-week":
        return {
          data: dataWeek,
          volume: "21,300",
          value: "$ 213,000.00",
          successfulAmount: "GHS 10,000.00",
          successfulCount: "100 payouts",
          failedAmount: "GHS 2,500.00",
          failedCount: "25 payouts",
          statusData: [
            { name: "Successful", value: 100, color: "#22C55E" },
            { name: "Failed", value: 25, color: "#EF4444" },
          ],
        };
      case "this-month":
        return {
          data: dataMonth,
          volume: "56,000",
          value: "$ 560,000.00",
          successfulAmount: "GHS 20,000.00",
          successfulCount: "200 payouts",
          failedAmount: "GHS 5,000.00",
          failedCount: "50 payouts",
          statusData: [
            { name: "Successful", value: 200, color: "#22C55E" },
            { name: "Failed", value: 50, color: "#EF4444" },
          ],
        };
      case "no-data":
        return {
          data: [
            { name: "Jan", value: 0, amount: "USD 0" },
            { name: "Feb", value: 0, amount: "USD 0" },
            { name: "Mar", value: 0, amount: "USD 0" },
            { name: "Apr", value: 0, amount: "USD 0" },
            { name: "May", value: 0, amount: "USD 0" },
            { name: "Jun", value: 0, amount: "USD 0" },
            { name: "Jul", value: 0, amount: "USD 0" },
            { name: "Aug", value: 0, amount: "USD 0" },
            { name: "Sep", value: 0, amount: "USD 0" },
            { name: "Oct", value: 0, amount: "USD 0" },
            { name: "Nov", value: 0, amount: "USD 0" },
            { name: "Dec", value: 0, amount: "USD 0" },
          ],
          volume: "0",
          value: "0",
          successfulAmount: "GHS 0.00",
          successfulCount: "0 payouts",
          failedAmount: "GHS 0.00",
          failedCount: "0 payouts",
          statusData: [{ name: "Empty", value: 1, color: "#E5E7EB" }],
        };
      case "all-time":
      default:
        return {
          data: dataAllTime,
          volume: "24,828",
          value: "$ 100,000.00",
          successfulAmount: "GHS 50,000.00",
          successfulCount: "500 payouts",
          failedAmount: "GHS 10,000.00",
          failedCount: "100 payouts",
          statusData: [
            { name: "Successful", value: 500, color: "#22C55E" },
            { name: "Failed", value: 100, color: "#EF4444" },
          ],
        };
    }
  };

  const {
    data,
    volume,
    value,
    successfulAmount,
    successfulCount,
    failedAmount,
    failedCount,
    statusData,
  } = getData();

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Payout Volume Card */}
      <Card className="col-span-1 h-full rounded-xl border-[#E5E8DF]">
        <CardContent className="p-0">
          <div className="flex border-spacing-0 items-start justify-between border-b border-[#E5E8DF]  ">
            <div className=" rounded-l-xl bg-[#F3F6F3] p-6  ">
              <p className="w-[131px] text-[12px]  text-gray-500 ">
                Payout volume
              </p>
              <h3 className="text-[24px] font-bold">{volume}</h3>
            </div>

            <div className="flex w-full flex-row items-start justify-between">
              <div className="flex flex-1 flex-col items-start px-6 py-6 pb-5">
                <p className="mb-1 text-[12px] text-gray-500">Payout value</p>
                <h3 className="whitespace-nowrap text-[24px] font-bold">
                  {value}
                </h3>
              </div>

              <div className="shrink-0 pr-6 pt-6">
                {timeframe !== "no-data" && (
                  <Select value={timeframe} onValueChange={setTimeframe}>
                    <SelectTrigger className="h-[36px] w-[130px] gap-2 border-none bg-[#E8F3E5] px-3 py-2 text-sm font-bold leading-5 text-[#1A5514] hover:bg-[#d9ead6]">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="this-week">This Week</SelectItem>
                      <SelectItem value="this-month">This Month</SelectItem>
                      <SelectItem value="all-time">All time</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </div>

          <div className="mt-12 h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <XAxis dataKey="name" hide />
                <CartesianGrid vertical={false} stroke="#F2F4EF" />
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ stroke: "#22C55E", strokeDasharray: "3 3" }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={timeframe === "no-data" ? "#E5E7EB" : "#22C55E"}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between px-6 pb-6 text-xs uppercase text-gray-400">
            {data.map((d) => (
              <span key={d.name}>{d.name}</span>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="col-span-1 flex h-full flex-col gap-4">
        {/* Average Processing Time */}
        <Card className="rounded-xl border-[#E5E8DF]">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <div className="rounded-lg bg-blue-50 p-2 text-blue-500">
                <IconClock size={20} />
              </div>
              <span className="text-sm font-medium text-[#161D14]">
                Average processing time
              </span>
            </div>
            <div>
              <span className="text-[16px] font-normal text-gray-900">
                10 mins
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Payout Status */}
        <Card className="flex-1 rounded-xl border-[#E5E8DF]">
          <CardContent className="flex h-full flex-col p-6">
            <div className="mb-6 flex items-center gap-2">
              <div className="rounded-lg bg-blue-50 p-2 text-blue-500">
                <IconChartPie size={20} />
              </div>
              <span className="text-[14px] font-normal text-gray-600">
                Payout status
              </span>
            </div>

            <div className="flex flex-1 items-center justify-between">
              <div className="h-[180px] w-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            timeframe === "no-data"
                              ? index === 0
                                ? "#E5E7EB" // Grey for first segment
                                : "#F3F4F6" // Lighter grey for second segment
                              : entry.color
                          }
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="ml-8 flex flex-1 flex-col">
                <div className="mb-6 flex items-start gap-3">
                  <div className="mt-2 h-2 w-2 rounded-full bg-green-500" />
                  <div>
                    <p className="text-[12px] font-normal text-gray-600">
                      Successful
                    </p>
                    <p className="font-norma text-[16px]">{successfulAmount}</p>
                    <p className="text-[16px] text-gray-400">{successfulCount}</p>
                  </div>
                </div>

                <div className="mb-6 w-full border-b border-dashed border-[#73796E] opacity-50" />

                <div className="flex items-start gap-3">
                  <div className="mt-2 h-2 w-2 rounded-full bg-red-500" />
                  <div>
                    <p className="text-[12px] font-normal text-gray-600">
                      Failed
                    </p>
                    <p className="text-[16px] font-normal">{failedAmount}</p>
                    <p className="text-[16px] text-gray-400">{failedCount}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
