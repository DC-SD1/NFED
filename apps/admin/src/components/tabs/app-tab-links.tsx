"use client";

import { Tabs, TabsList, TabsTrigger } from "@cf/ui";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import React from "react";

export interface TabLink {
  icon?: ComponentType<{ className?: string }>;
  label: string;
  href: string;
  value: string;
}

interface Props {
  children: React.ReactNode;
  tabs: TabLink[];
  defaultValue: string;
}

const AppTabLink = ({ children, tabs, defaultValue }: Props) => {
  const pathname = usePathname();
  return (
    <div className="w-full">
      <Tabs
        defaultValue={
          tabs.find((x) => x.href === pathname)?.value || defaultValue
        }
        className="min-w-12/12 scrollbar-hide overflow-x-auto"
      >
        <div className="flex w-full items-center justify-between">
          <TabsList
            className={
              "h-12 w-full justify-start rounded-none border-b-2 border-[#E5E8DF] bg-white p-0"
            }
          >
            {tabs.map((tab) => (
              <Link href={tab.href} key={tab.value}>
                <TabsTrigger
                  className="text-secondary-foreground h-12 gap-2 rounded-none border-0 text-base font-normal data-[state=active]:border-b-2 data-[state=active]:border-b-[#1A5514] data-[state=active]:bg-transparent data-[state=active]:font-bold data-[state=active]:text-[#1A5514]"
                  key={tab.value}
                  value={tab.value}
                >
                  {tab.icon && <tab.icon className="size-5" />} {tab.label}
                </TabsTrigger>
              </Link>
            ))}
          </TabsList>
        </div>
      </Tabs>
      <div className="h-[80vh] w-full overflow-auto py-6 sm:py-8">
        {children}
      </div>
    </div>
  );
};

export default AppTabLink;
