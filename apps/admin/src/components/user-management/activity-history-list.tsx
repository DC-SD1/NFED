"use client";

import { React } from "@cf/ui/icons";
import { format } from "date-fns";

import type { AuditLog } from "@/types/user-management.types";
import { ACTIVITY_TYPES } from "@/utils/constants/common";
import { findOption } from "@/utils/helpers/common-helpers";

interface Props {
  logs: AuditLog[];
}

export default function ActivityHistoryList({ logs }: Props) {
  return (
    <div>
      {logs.map((log, index) => (
        <div key={index} className="flex flex-col gap-1 py-3">
          <p className={"text-sm"}>
            {findOption(ACTIVITY_TYPES, log.activityType.toString())?.label ??
              "N/A"}
          </p>
          <p className={"text-secondary-foreground text-xs"}>
            {format(log.occurredOnUtc, "dd MMMM yyyy, hh:mm a")}
          </p>
        </div>
      ))}
    </div>
  );
}
