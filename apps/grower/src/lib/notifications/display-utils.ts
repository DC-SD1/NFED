import { MAX_BADGE_COUNT } from "@/lib/constants";
import { logger } from "@/lib/logger";

import type { NotificationItem } from "./notifications-store";
import {
  CTA_WORKFLOWS_WITHOUT_ACTION,
  getWorkflowCtaKey,
} from "./workflow-config";

export const toTitleCase = (value: string) =>
  value
    .replace(/[_-]/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");

export function getNotificationLabel(
  notification: NotificationItem,
  translate: (key: string) => string,
) {
  if (notification.category) {
    return translate(`tab${notification.category}`);
  }

  if (notification.workflowName) {
    return notification.workflowName;
  }

  if (notification.subject) {
    return notification.subject;
  }

  if (notification.tags[0]) {
    return toTitleCase(notification.tags[0]);
  }

  return translate("tabAlert");
}

export function getNotificationBody(notification: NotificationItem) {
  if (notification.body) {
    return toTitleCase(notification.body);
  }

  if (notification.subject) {
    return notification.subject;
  }

  if (notification.description) {
    return toTitleCase(notification.description);
  }

  return null;
}

export function getNotificationCtaLabel(
  notification: NotificationItem,
  translate: (key: string) => string,
) {
  const ctaKey = getWorkflowCtaKey(notification.workflowIdentifier);
  return ctaKey ? translate(ctaKey) : translate("ctaDefault");
}

export function notificationHasCta(notification: NotificationItem): boolean {
  const { workflowIdentifier } = notification;

  if (!workflowIdentifier) {
    logger.debug("Unknown workflow, showing CTA with fallback destination");
    return true;
  }

  return !CTA_WORKFLOWS_WITHOUT_ACTION.has(workflowIdentifier);
}

/**
 * Formats badge count with a max cap display (e.g., "50+")
 * @param count - The count to format
 * @param maxDisplay - The maximum number to display before showing "+" (default: MAX_BADGE_COUNT)
 * @returns Formatted count string
 */
export function formatBadgeCount(
  count: number,
  maxDisplay = MAX_BADGE_COUNT,
): string {
  if (count >= maxDisplay) {
    return `${maxDisplay}+`;
  }
  return count.toString();
}

/**
 * @deprecated Use formatBadgeCount instead
 */
export const formatNotificationCount = formatBadgeCount;
