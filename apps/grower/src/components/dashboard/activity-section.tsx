"use client";

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@cf/ui";
import type { LucideIcon } from "lucide-react";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { cn } from "@/lib/utils";

import { EmptyState } from "./empty-state";

interface ActivityTab {
  id: string;
  label: string;
  count?: number;
}

interface ActivitySectionProps {
  title: string;
  tabs: ActivityTab[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  viewMoreHref?: string;
  className?: string;
  children?: React.ReactNode;
  emptyState?: {
    icon?: LucideIcon;
    title: string;
    description?: string;
  };
}

export function ActivitySection({
  title,
  tabs,
  activeTab = tabs[0]?.id || "",
  onTabChange,
  viewMoreHref,
  className,
  children,
}: ActivitySectionProps) {
  const [currentTab, setCurrentTab] = React.useState(activeTab);

  const handleTabChange = (value: string) => {
    setCurrentTab(value);
    onTabChange?.(value);
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        <Button variant="ghost" size="icon" className="size-8">
          <MoreHorizontal className="size-4" />
        </Button>
      </CardHeader>

      <CardContent>
        <Tabs value={currentTab} onValueChange={handleTabChange}>
          <TabsList className="grid-cols-auto grid h-auto w-full gap-1 bg-transparent p-0">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium transition-all",
                  "data-[state=active]:bg-transparent data-[state=active]:shadow-none",
                  "data-[state=active]:border-primary data-[state=active]:border-b-2",
                  "hover:text-foreground",
                )}
              >
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="text-muted-foreground ml-1 text-xs">
                    ({tab.count})
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={currentTab} className="mt-4">
            {children || (
              <EmptyState
              // icon={
              //   emptyState?.icon ||
              //   (title.includes("Notification") ? Bell : CheckSquare)
              // }
              // title={emptyState?.title || `No ${title.toLowerCase()}`}
              // description={emptyState?.description || "You're all caught up!"}
              // className="py-8"
              />
            )}
          </TabsContent>
        </Tabs>

        {viewMoreHref && (
          <div className="mt-4 text-center">
            <Link
              href={viewMoreHref}
              className="text-primary text-sm font-medium hover:underline"
            >
              View more
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
