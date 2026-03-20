"use client";

import { Button, cn } from "@cf/ui";
import { IconEye } from "@tabler/icons-react";
import React from "react";

interface Props {
  title: string;
  value: string | React.ReactNode;
  valueClassName?: string;
  onView?: () => void;
}

export default function KycItemTile({
  title,
  value,
  onView,
  valueClassName,
}: Props) {
  return (
    <div className={"flex items-center justify-between gap-4"}>
      <div className="flex flex-col gap-0.5">
        <p className="text-secondary-foreground text-sm">{title}</p>
        {typeof value === "string" ? (
          <p className={cn("truncate text-sm", valueClassName)}>{value}</p>
        ) : (
          value
        )}
      </div>
      <div>
        {onView && (
          <Button
            size={"sm"}
            variant={"secondary"}
            onClick={onView}
            className="h-8 text-sm font-bold"
          >
            <IconEye className={"size-4"} />
            View
          </Button>
        )}
      </div>
    </div>
  );
}
