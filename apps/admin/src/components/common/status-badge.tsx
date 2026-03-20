"use client";

import { Badge, cn } from "@cf/ui";
import {
  IconCircleCheck,
  IconCircleDashed,
  IconCircleX,
  IconClockHour4,
  IconExclamationCircle,
  IconMailShare,
  IconUserPlus,
  IconUserX,
} from "@tabler/icons-react";
import { CircleOff, Loader } from "lucide-react";
import React from "react";

import {
  STATUS_BOLD_COLORS,
  STATUS_COLORS,
} from "@/utils/constants/status-constants";

interface Props {
  status: string;
  statusText?: string;
  isBold?: boolean;
  iconClassName?: string;
  className?: string;
}

const StatusBadge = ({
  status,
  statusText,
  isBold,
  iconClassName,
  className,
}: Props) => {
  const userStatus = status.toLowerCase();

  const statusIcon: Record<
    string,
    React.ComponentType<{ className?: string }>
  > = {
    deactivated: CircleOff,
    inactive: IconUserX,
    rejected: IconCircleX,
    declined: IconCircleX,
    pending: Loader,
    active: IconCircleCheck,
    approved: IconCircleCheck,
    expired: IconExclamationCircle,
    "pending suspension": IconClockHour4,
    "in progress": IconClockHour4,
    suspended: IconUserX,
    invited: IconMailShare,
    deactivation: IconUserX,
    "grower kyc": IconUserPlus,
    completed: IconCircleCheck,
    "in training": IconCircleDashed,
    accepted: IconCircleCheck,
  };

  const IconComponent = statusIcon[userStatus];

  return (
    <Badge
      className={cn(
        "flex w-fit items-center gap-1 rounded-md border border-[#E5E8DF] bg-white px-1.5 text-xs font-normal capitalize hover:bg-white",
        isBold
          ? STATUS_BOLD_COLORS[userStatus]
          : STATUS_COLORS[userStatus] || "text-foreground",
        className,
      )}
    >
      {IconComponent && (
        <IconComponent className={cn("size-3", iconClassName)} />
      )}
      {statusText ?? status}
    </Badge>
  );
};

export default StatusBadge;
