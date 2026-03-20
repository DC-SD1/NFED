"use client";

import {
  IconCircleCheck,
  IconClock,
  IconLayoutGrid,
  IconLock,
} from "@tabler/icons-react";
import React from "react";

const TABS = [
  { id: "all", label: "All", icon: IconLayoutGrid },
  { id: "active", label: "Active", icon: IconCircleCheck },
  { id: "pending", label: "Pending", icon: IconClock },
  { id: "frozen", label: "Frozen", icon: IconLock },
];

export default function FulfilmentWalletTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: string;
  onTabChange: (tab: string) => void;
}) {
  return (
    <div className="border-b border-gray-200">
      <div className="flex gap-8">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 border-b-2 pb-3 text-sm font-medium transition-colors ${
                isActive
                  ? "border-[#36B92E] text-[#36B92E]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
