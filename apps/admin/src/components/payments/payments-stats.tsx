import { IconCash, IconCreditCard, IconLoader } from "@tabler/icons-react";
import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  subStats?: { label: string; value: string | number }[];
}

const StatCard = ({
  title,
  value,
  icon: Icon,
  iconColor,
  iconBg,
  subStats,
}: StatCardProps) => (
  <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
    <div className="flex items-center gap-3">
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconBg}`}
      >
        <Icon size={18} className={iconColor} />
      </div>
      <span className="text-base font-medium text-gray-900">{title}</span>
    </div>

    {subStats ? (
      <div className="flex w-full justify-between pt-2">
        {subStats.map((stat, index) => (
          <div
            key={index}
            className={`flex flex-1 flex-col gap-1 ${
              index !== 0 ? "pl-4" : ""
            } ${
              index !== subStats.length - 1
                ? "border-r border-dashed border-gray-300 pr-4"
                : ""
            }`}
            style={{
              borderColor: "#D0D5DD", // Explicit color from typical designs if gray-300 isn't enough
            }}
          >
            <span className="text-sm font-normal text-gray-600">
              {stat.label}
            </span>
            <span className="text-xl font-medium text-gray-900">
              {stat.value}
            </span>
          </div>
        ))}
      </div>
    ) : (
      <div className="pt-2">
        <span className="text-2xl font-semibold text-gray-900">{value}</span>
      </div>
    )}
  </div>
);

export default function PaymentsStats() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <StatCard
        title="Total payments volume"
        value="0"
        icon={IconCash}
        iconColor="text-green-600"
        iconBg="bg-green-100" // Updated to match likely design
      />
      <StatCard
        title="Total payments value"
        value="$0.00" // Formatted value
        icon={IconCreditCard}
        iconColor="text-blue-600"
        iconBg="bg-blue-100"
      />
      <StatCard
        title="Payment status"
        value=""
        icon={IconLoader}
        iconColor="text-purple-600"
        iconBg="bg-purple-100"
        subStats={[
          { label: "New", value: 3 },
          { label: "Verified", value: 4 },
          { label: "Confirmed", value: 10 },
          { label: "Rejected", value: 2 },
        ]}
      />
    </div>
  );
}
