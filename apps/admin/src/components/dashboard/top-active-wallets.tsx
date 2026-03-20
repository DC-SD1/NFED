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
import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { name: "Juapong", value: 100, color: "#32CD32" }, // lime-500
  { name: "Gaa", value: 70, color: "#32CD32" },
  { name: "Axim", value: 50, color: "#32CD32" },
  { name: "Wenchi", value: 30, color: "#32CD32" },
  { name: "Wa", value: 20, color: "#32CD32" },
];

const CustomBarLabel = (props: any) => {
  const { x, y, height, value } = props;
  return (
    <text
      x={x + 10}
      y={y + height / 2}
      fill="#fff"
      textAnchor="start"
      dominantBaseline="middle"
      className="text-sm font-bold"
    >
      {value}%
    </text>
  );
};

export default function TopActiveWallets() {
  return (
    <Card className="rounded-xl border bg-white shadow-sm">
      <div>
        <div className="mb-6 flex items-center border-b p-4">
          <h3 className="border-r pr-2 text-sm font-bold text-gray-900">
            Top 5 active wallets
          </h3>
          <div className="pl-4">
            <Select defaultValue="transaction-count">
              <SelectTrigger className="h-8 w-auto gap-2 border-none bg-transparent px-0 text-xs font-bold text-gray-900 hover:bg-transparent focus:ring-0">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="transaction-count">
                  By transaction count
                </SelectItem>
                <SelectItem value="volume">By volume</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <CardContent className="p-6">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={data}
              margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
              barSize={40}
            >
              <XAxis type="number" hide />
              <YAxis
                dataKey="name"
                type="category"
                width={100}
                tick={{ fontSize: 14, fill: "#374151" }}
                axisLine={false}
                tickLine={false}
              />
              <Bar dataKey="value" radius={[4, 4, 4, 4]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
                <LabelList dataKey="value" content={<CustomBarLabel />} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
