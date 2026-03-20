"use client";

import {
  IconBuildingBank,
  IconFileCertificate,
  IconLayoutGrid,
  IconShieldLock,
} from "@tabler/icons-react";
import React from "react";

const TABS = [
  { id: "all", label: "All", icon: IconLayoutGrid },
  { id: "bank-transfer", label: "Bank transfer", icon: IconBuildingBank },
  { id: "escrow", label: "Escrow", icon: IconShieldLock },
  {
    id: "letter-of-credit",
    label: "Letter of credit",
    icon: IconFileCertificate,
  },
];

export default function PaymentsTabs({
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
