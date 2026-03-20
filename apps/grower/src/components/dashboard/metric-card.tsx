import { Card, CardContent, CardHeader, CardTitle } from "@cf/ui";
import { ChevronRight, type LucideIcon } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  href?: string;
  onClick?: () => void;
  className?: string;
  subMetrics?: {
    label: string;
    value: string | number;
    status?: "success" | "warning" | "error" | "neutral";
  }[];
}

const statusColors = {
  success: "text-green-600",
  warning: "text-yellow-600",
  error: "text-red-600",
  neutral: "text-muted-foreground",
};

export function MetricCard({
  title,
  value,
  icon: Icon,
  href,
  onClick,
  className,
  subMetrics,
}: MetricCardProps) {
  const isClickable = href || onClick;
  const Component = href ? Link : isClickable ? "button" : "div";

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-shadow",
        isClickable && "cursor-pointer hover:shadow-md",
        className,
      )}
    >
      <Component
        href={href!}
        onClick={onClick}
        className={cn(
          "block",
          isClickable &&
            "focus:ring-ring focus:outline-none focus:ring-2 focus:ring-offset-2",
        )}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-muted-foreground text-sm font-medium">
            {Icon && <Icon className="mb-1 size-4" />}
            {title}
          </CardTitle>
          {isClickable && (
            <ChevronRight className="text-muted-foreground size-4" />
          )}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>

          {subMetrics && subMetrics.length > 0 && (
            <div className="mt-4 flex items-center gap-4">
              {subMetrics.map((metric, index) => (
                <React.Fragment key={metric.label}>
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-xs">
                      {metric.label}
                    </p>
                    <p
                      className={cn(
                        "text-sm font-medium",
                        metric.status && statusColors[metric.status],
                      )}
                    >
                      {metric.value}
                    </p>
                  </div>
                  {index < subMetrics.length - 1 && (
                    <div className="bg-border h-8 w-px" />
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </CardContent>
      </Component>
    </Card>
  );
}
