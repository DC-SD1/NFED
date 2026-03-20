"use client";

import {
  cn,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@cf/ui";
import React from "react";

interface Props {
  title: string;
  value: string | React.ReactNode;
  Icon?: React.ComponentType<{ className?: string }>;
  actionButton?: React.ReactNode;
  className?: string;
  valueClassName?: string;
}

export default function DetailRowTile({
  title,
  value,
  Icon,
  actionButton,
  className,
  valueClassName,
}: Props) {
  return (
    <div
      className={cn("flex w-full items-center justify-between py-2", className)}
    >
      <div
        className={"text-secondary-foreground flex w-1/2 items-center gap-1"}
      >
        {Icon && <Icon className={"size-5"} />}
        <p className={"text-sm"}>{title}</p>
      </div>
      <div className={"flex w-1/2 items-center gap-4"}>
        {typeof value === "string" ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className={cn("truncate text-sm", valueClassName)}>
                  {value}
                </p>
              </TooltipTrigger>
              <TooltipContent>{value}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          value
        )}
        {actionButton}
      </div>
    </div>
  );
}
