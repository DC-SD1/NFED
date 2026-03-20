"use client";

import { Card, CardContent, CardDescription } from "@cf/ui";
import { IconChartPie } from "@tabler/icons-react";
import React from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

const fundingUtilizationData = [
    { name: "Allocated to tasks", value: 20000, color: "#36B92E" },
    { name: "Spent", value: 10000, color: "#f70707" },
];

const expenseCategoriesData = [
    { name: "Grower payouts", value: 20000, color: "#36B92E" },
    { name: "Aggregation", value: 20000, color: "#8ff28a" }, 
    { name: "Operational costs", value: 10000, color: "#c0e7be" },
];

interface ChartCardProps {
    title: string;
    icon?: React.ReactNode;
    data: { name: string; value: number; color: string }[];
    innerRadius?: number;
    outerRadius?: number;
}

const ChartCard = ({
    title,
    icon,
    data,
    innerRadius = 60,
    outerRadius = 80,
}: ChartCardProps) => {
    return (
        <Card className="rounded-xl border bg-white shadow-sm">
            <div className="mb-6 flex items-center p-4">
                <div className="flex items-center gap-1">
                    <span className="bg-blue-100 text-blue-500 rounded-sm p-1">{icon}</span>
                    <h3 className="text-sm text-gray-900">
                        {title}
                    </h3>
                </div>
                <div className="pr-4" />
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

export default function FulfilmentChart() {
    return (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 mt-8 lg:mt-10">
            <ChartCard icon={<IconChartPie size={16} />} title="Fund utilization" data={fundingUtilizationData} />
            <ChartCard icon={<IconChartPie size={16} />} title="Expense categories" data={expenseCategoriesData} />
        </div>
    );
}
