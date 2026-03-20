"use client";

import { cn } from "@cf/ui";
import React, { useState } from "react";

import type { Tab } from "@/components/tabs/app-tabs";

interface Props {
  tabs: Tab[];
  defaultValue?: string;
  onChange?: (tabValue: string) => void;
}

export default function ContentViewTab({
  tabs,
  defaultValue,
  onChange,
}: Props) {
  const [selectedTab, setSelectedTab] = useState<string>(defaultValue || "");

  const handleTabClick = (tabValue: string) => {
    setSelectedTab(tabValue);
    onChange?.(tabValue);
  };

  return (
    <div className={"flex items-center gap-3 rounded-lg bg-[#F3F6F3] p-1"}>
      {tabs.map((tab) => (
        <button
          onClick={() => handleTabClick(tab.value)}
          key={tab.value}
          className={cn(
            `text-secondary-foreground flex h-9 items-center gap-2 rounded-md px-2 py-2.5`,
            selectedTab === tab.value &&
              "bg-white shadow-[0_2px_6px_0_rgba(22,29,20,0.12)]",
          )}
        >
          {tab.icon && <tab.icon className={"size-4"} />}
          {tab.label}
        </button>
      ))}
    </div>
  );
}
