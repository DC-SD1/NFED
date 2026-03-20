"use client";

import { Button } from "@cf/ui";
import { type LucideIcon, Plus } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  illustration?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
    icon?: LucideIcon;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  illustration,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-4 py-12 text-center",
        className,
      )}
    >
      {illustration ? (
        <div className="mb-6">{illustration}</div>
      ) : Icon ? (
        <div className="bg-muted mb-6 rounded-full p-6">
          <Icon className="text-muted-foreground size-12" />
        </div>
      ) : null}

      <h3 className="mb-2 text-xl font-semibold">{title}</h3>

      {description && (
        <p className="text-muted-foreground mb-6 max-w-sm text-sm">
          {description}
        </p>
      )}

      {action &&
        (action.href ? (
          <Button asChild size="lg" className="rounded-full">
            <Link href={action.href}>
              {action.icon ? (
                <action.icon className="mr-2 size-5" />
              ) : (
                <Plus className="mr-2 size-5" />
              )}
              {action.label}
            </Link>
          </Button>
        ) : (
          <Button onClick={action.onClick} size="lg" className="rounded-full">
            {action.icon ? (
              <action.icon className="mr-2 size-5" />
            ) : (
              <Plus className="mr-2 size-5" />
            )}
            {action.label}
          </Button>
        ))}
    </div>
  );
}
