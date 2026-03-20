import { differenceInDays, isValid, parse, parseISO } from "date-fns";

export type StatusColor =
  | "default"
  | "info"
  | "success"
  | "warning"
  | "destructive";

export interface PlanStatusLine {
  labelKey: string;
  color: StatusColor;
  params?: Record<string, string | number>;
}

export function derivePlanStatusLine(
  status: string | undefined,
  startDateString: string | undefined,
  now: Date = new Date(),
): PlanStatusLine | null {
  // Handle static statuses
  const normalized = (status ?? "").toLowerCase();
  if (normalized === "completed") {
    return { labelKey: "plans.status.completed", color: "success" };
  }
  if (normalized === "cancelled") {
    return { labelKey: "plans.status.cancelled", color: "destructive" };
  }
  if (normalized === "paused") {
    return { labelKey: "plans.status.paused", color: "warning" };
  }
  if (normalized === "active") {
    return { labelKey: "plans.status.inProgress", color: "info" };
  }

  if (!startDateString) return null;

  // 🧩 Try ISO first
  let date = parseISO(startDateString);

  // 🩹 Fallback to "dd/MM/yyyy"
  if (!isValid(date)) {
    date = parse(startDateString, "dd/MM/yyyy", new Date());
  }

  if (!isValid(date)) return null;

  const days = differenceInDays(date, now);

  if (days < 0) {
    return {
      labelKey: "plans.statusLine.startDatePassed",
      color: "destructive",
    };
  }
  if (days === 0) {
    return { labelKey: "plans.statusLine.dueToday", color: "success" };
  }
  if (days <= 7) {
    return {
      labelKey: "plans.statusLine.daysToGo",
      color: "warning",
      params: { days },
    };
  }

  const months = Math.max(1, Math.floor(days / 30));
  return {
    labelKey: "plans.statusLine.monthsToGo",
    color: "info",
    params: { months },
  };
}

export type ChipStatus = "Due" | "Upcoming" | "Due soon" | "Overdue";

export function computeChipStatus(
  startDateString: string | undefined,
  now: Date = new Date(),
): ChipStatus | null {
  if (!startDateString) return null;

  // 🧩 Try ISO first (e.g. "2025-10-20T13:41:23.1137899Z")
  let date = parseISO(startDateString);

  // 🩹 If not valid, fall back to "dd/MM/yyyy" format
  if (!isValid(date)) {
    date = parse(startDateString, "dd/MM/yyyy", new Date());
  }

  if (!isValid(date)) return null;

  const days = differenceInDays(date, now);

  if (days < 0) return "Overdue";
  if (days === 0) return "Due";
  if (days <= 7) return "Due soon";
  return "Upcoming";
}
