"use client";

import { Button, Card, CardContent } from "@cf/ui";
import { IconChevronDown, IconChevronUp, IconUsers } from "@tabler/icons-react";
import React, { useState } from "react";

export default function OperationsOverviewSection() {
  const [isOpen, setIsOpen] = useState(true);

  const overviewData = [
    {
      title: "All Growers",
      icon: IconUsers,
      iconBg: "bg-white",
      iconColor: "text-green-500",
      stats: [
        { figure: "1,430", title: "Total" },
        { figure: "1,180", title: "Active" },
        { figure: "120", title: "Inactive" },
      ],
    },
    {
      title: "All buyers",
      icon: IconUsers,
      iconBg: "bg-white",
      iconColor: "text-blue-500",
      stats: [
        { figure: "400", title: "Total" },
        { figure: "100", title: "Active with orders" },
      ],
    },
    {
      title: "Agents",
      icon: IconUsers,
      iconBg: "bg-white",
      iconColor: "text-yellow-500",
      stats: [
        { figure: "400", title: "Total" },
        { figure: "$670k", title: "Liquidity exposure" },
      ],
    },
  ];

  return (
    <div className="rounded-xl border p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-4">
        <span className="font-bold">Operations overview</span>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen((prev) => !prev)}
          className="w-8 border-none p-0 text-gray-400 hover:bg-transparent"
        >
          {isOpen ? (
            <IconChevronUp size={16} className="text-gray-700" />
          ) : (
            <IconChevronDown size={16} className="text-gray-700" />
          )}
        </Button>
      </div>

      {/* Content */}
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="grid grid-cols-1 gap-4 pt-2 lg:grid-cols-3">
          {overviewData.map((item, index) => (
            <OverviewCard key={index} {...item} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------- Reusable Card ----------------

const OverviewCard = ({
  title,
  icon: Icon,
  stats,
  iconBg,
  iconColor,
}: {
  title: string;
  icon: React.ElementType;
  stats: { figure: string; title: string }[];
  iconBg: string;
  iconColor: string;
}) => {
  return (
    <Card className="rounded-xl border bg-[#F7FAF6] shadow-sm">
      <CardContent className="flex h-full flex-col gap-3 p-3">
        {/* Header */}
        <div className="flex items-center gap-2">
          <div
            className={`flex h-6 w-6 items-center justify-center rounded-sm shadow-lg ${iconBg} ${iconColor}`}
          >
            <Icon size={16} />
          </div>
          <span className="text-sm font-medium text-gray-900">{title}</span>
        </div>

        {/* Stats */}
        <div className="flex justify-between">
          {stats.map((stat, index) => (
            <React.Fragment key={index}>
              <div className="flex-1 px-3">
                <OverViewBoard figure={stat.figure} title={stat.title} />
              </div>
              {/* Only add divider if not last item */}
              {index < stats.length - 1 && (
                <div className="border-r border-dashed border-gray-300" />
              )}
            </React.Fragment>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// ---------------- Small Stat Item ----------------

const OverViewBoard = ({
  figure,
  title,
}: {
  figure: string;
  title: string;
}) => {
  return (
    <div className="flex flex-col items-start gap-1">
      <p className="text-sm font-bold">{figure}</p>
      <p className="text-xs text-gray-500">{title}</p>
    </div>
  );
};
