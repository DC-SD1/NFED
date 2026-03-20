"use client";

import { Badge } from "@cf/ui";
import {
    IconAlertTriangle,
    IconCircleCheck,
    IconClockHour4,
} from "@tabler/icons-react";
import React from "react";

const statusColors: Record<string, string> = {
    Paid: "bg-green-50 text-green-700 border-green-200",
    Pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
    Overdue: "bg-red-50 text-red-700 border-red-200",
    Success: "bg-green-50 text-green-700 border-green-200",
    Failed: "bg-red-50 text-red-700 border-red-200",
};

const statusIcons: Record<string, React.ElementType> = {
    Paid: IconCircleCheck,
    Pending: IconClockHour4,
    Overdue: IconAlertTriangle,
    Success: IconCircleCheck,
    Failed: IconAlertTriangle,
};

export default function StatusBadge({ status }: { status: string }) {
    const Icon = statusIcons[status];

    return (
        <Badge
            className={`${statusColors[status]} flex w-fit items-center gap-1 rounded-sm border text-xs font-medium`}
        >
            {Icon && <Icon className="h-4 w-4" />}
            {status}
        </Badge>
    );
}