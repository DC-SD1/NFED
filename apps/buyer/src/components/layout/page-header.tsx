import { Button } from "@cf/ui";
import type { LucideIcon } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
    variant?: "default" | "secondary" | "outline" | "ghost";
  };
  breadcrumb?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  action,
  breadcrumb,
  className,
  children,
}: PageHeaderProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {breadcrumb && (
        <div className="text-muted-foreground text-sm">{breadcrumb}</div>
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>

        {action && (
          <Button
            onClick={action.onClick}
            variant={action.variant || "default"}
            className="shrink-0"
          >
            {action.icon && <action.icon className="mr-2 size-4" />}
            {action.label}
          </Button>
        )}
      </div>

      {children}
    </div>
  );
}
