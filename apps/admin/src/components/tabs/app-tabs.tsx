"use client";

import { cn, Tabs, TabsContent, TabsList, TabsTrigger } from "@cf/ui";
import type { ReactNode } from "react";
import React, { useState } from "react";

export interface Tab {
  value: string;
  label: string;
  icon?: React.ComponentType<{
    className?: string;
  }>;
  iconComponent?: React.FunctionComponent<{
    fill?: string;
    size?: string;
  }>;
  content: ReactNode;
}

interface AppTabs {
  tabs: Tab[];
  children?: React.ReactNode;
  defaultValue?: string;
  tabClassName?: string;
  className?: string;
  contentClassName?: string;
  triggerClassName?: string;
  onTabChanged?: (tab: string) => void;
}

export default function AppTabs({
  tabs,
  children,
  defaultValue,
  tabClassName,
  className,
  contentClassName,
  triggerClassName,
  onTabChanged,
}: AppTabs) {
  const [activeTab, setActiveTab] = useState(defaultValue || tabs[0]?.value);
  const handleSetActiveTab = (tab: string) => {
    setActiveTab(tab);
    onTabChanged?.(tab);
  };

  return (
    <Tabs
      defaultValue={defaultValue || tabs[0]?.value}
      className={tabClassName}
      onValueChange={handleSetActiveTab}
    >
      <TabsList
        className={cn(
          "h-12 w-full justify-start rounded-none border-b-2 border-[#E5E8DF] bg-white p-0",
          className,
        )}
      >
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className={cn(
              "text-secondary-foreground h-12 gap-2 rounded-none border-0 text-base font-normal data-[state=active]:border-b-2 data-[state=active]:border-b-[#1A5514] data-[state=active]:bg-transparent data-[state=active]:font-bold data-[state=active]:text-[#1A5514]",
              triggerClassName,
            )}
          >
            {tab.icon && <tab.icon className="size-4" />}
            {tab.iconComponent && (
              <tab.iconComponent
                size="16"
                fill={activeTab === tab.value ? "#1A5514" : "#161D14"}
              />
            )}
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {children}

      {tabs.map((tab) => (
        <TabsContent
          key={tab.value}
          value={tab.value}
          className={contentClassName}
        >
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
