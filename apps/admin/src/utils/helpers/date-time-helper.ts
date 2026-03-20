import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds,
  format,
  isValid,
} from "date-fns";

/**
 * Formats a date to a time ago string
 * @param date - The date to format
 * @returns The formatted time ago string
 */
export function formatTimeAgo(date: Date): string {
  if (!isValid(date)) {
    return "Invalid date";
  }

  const now = new Date();
  const seconds = differenceInSeconds(now, date);

  // Less than a minute
  if (seconds <= 60) {
    return "Just now";
  }

  // Minutes
  const minutes = differenceInMinutes(now, date);
  if (minutes < 60) {
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  }

  // Hours
  const hours = differenceInHours(now, date);
  if (hours < 24) {
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  }
  // If it's exactly 1 day ago, return "Yesterday"
  const days = differenceInDays(now, date);
  if (days === 1) {
    return `Yesterday at ${format(date, "hh:mma")}`;
  }

  // Days
  if (days < 7) {
    return `${days} ${days === 1 ? "day" : "days"} at ${format(date, "hh:mma")}`;
  }

  return `${format(date, "dd-MMM-yyyy at hh:mma")}`;
}
