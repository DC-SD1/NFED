const WORKFLOW_IDENTIFIERS = [
  "kyc-reminder-workflow",
  "kyc-approved-workflow",
  "kyc-rejected-workflow",
  "seasonal-reminder-workflow",
  "harvest-notification-workflow",
  "overdue-farm-task-workflow",
  "profile-update-workflow",
  "farm-owner-manager-joined",
  "kyc-submitted-workflow",
] as const;

export type NotificationWorkflow = (typeof WORKFLOW_IDENTIFIERS)[number];

export type NotificationCategory = "Reminder" | "Task" | "Alert";

export type NotificationDestination =
  | "profile"
  | "farmPlanSummary"
  | "farmManagers"
  | "farmPlanContext";

const CTA_TRANSLATION_KEYS = [
  "ctaProfile",
  "ctaFarmPlan",
  "ctaFarmManagers",
] as const;

export type NotificationWorkflowCtaKey = (typeof CTA_TRANSLATION_KEYS)[number];

export const CTA_WORKFLOWS_WITHOUT_ACTION = new Set<NotificationWorkflow>([
  // Currently all workflows have CTAs configured, so this set is empty
  // Add workflow identifiers here only if they truly don't have action buttons
  "kyc-submitted-workflow",
]);

export interface FarmEntityIds {
  farmPlanId?: string;
  farmId?: string;
  landId?: string;
}

/**
 * Safely extracts farm entity IDs from notification payload
 * Guards against missing or invalid values
 */
export function extractFarmEntityIds(
  payload?: Record<string, unknown>,
): FarmEntityIds {
  if (!payload || typeof payload !== "object") {
    return {};
  }

  const result: FarmEntityIds = {};

  if (typeof payload.farmPlanId === "string" && payload.farmPlanId.trim()) {
    result.farmPlanId = payload.farmPlanId.trim();
  }

  if (typeof payload.farmId === "string" && payload.farmId.trim()) {
    result.farmId = payload.farmId.trim();
  }

  if (typeof payload.landId === "string" && payload.landId.trim()) {
    result.landId = payload.landId.trim();
  }

  return result;
}

export interface NotificationWorkflowConfig {
  identifier: NotificationWorkflow;
  category: NotificationCategory;
  destination: NotificationDestination;
  ctaTranslationKey: NotificationWorkflowCtaKey | null;
}

type DestinationResolver = (
  locale: string,
  payload?: Record<string, unknown>,
) => string;

const DESTINATION_RESOLVERS: Record<
  NotificationDestination,
  DestinationResolver
> = {
  profile: (locale) => `/${locale}/profile`,
  farmPlanSummary: (locale) => `/${locale}/farm-owner/farm-lands`,
  farmManagers: (locale) => `/${locale}/farm-owner/farm-managers`,
  farmPlanContext: (locale, payload) => {
    const ids = extractFarmEntityIds(payload);

    // Priority 1: Navigate to plan summary if farmPlanId is available
    if (ids.farmPlanId) {
      const params = new URLSearchParams();
      params.set("farmPlanId", ids.farmPlanId);
      if (ids.farmId) params.set("farmId", ids.farmId);
      if (ids.landId) params.set("landId", ids.landId);
      return `/${locale}/farm-owner/farm-plan/summary?${params.toString()}`;
    }

    // Priority 2: Navigate to farm details if farmId is available
    if (ids.farmId) {
      const params = new URLSearchParams();
      if (ids.landId) params.set("landId", ids.landId);
      const query = params.toString();
      return `/${locale}/farm-owner/farm-lands/details/${ids.farmId}${query ? `?${query}` : ""}`;
    }

    // Priority 3: Fallback to farms list
    return `/${locale}/farm-owner/farm-lands`;
  },
};

export const NOTIFICATION_WORKFLOW_CONFIG: Record<
  NotificationWorkflow,
  NotificationWorkflowConfig
> = {
  "kyc-reminder-workflow": {
    identifier: "kyc-reminder-workflow",
    category: "Reminder",
    destination: "profile",
    ctaTranslationKey: "ctaProfile",
  },
  "kyc-approved-workflow": {
    identifier: "kyc-approved-workflow",
    category: "Alert",
    destination: "profile",
    ctaTranslationKey: "ctaProfile",
  },
  "kyc-submitted-workflow": {
    identifier: "kyc-submitted-workflow",
    category: "Alert",
    destination: "profile",
    ctaTranslationKey: "ctaProfile",
  },
  "kyc-rejected-workflow": {
    identifier: "kyc-rejected-workflow",
    category: "Alert",
    destination: "profile",
    ctaTranslationKey: "ctaProfile",
  },
  "seasonal-reminder-workflow": {
    identifier: "seasonal-reminder-workflow",
    category: "Reminder",
    destination: "farmPlanContext",
    ctaTranslationKey: "ctaFarmPlan",
  },
  "harvest-notification-workflow": {
    identifier: "harvest-notification-workflow",
    category: "Alert",
    destination: "farmPlanContext",
    ctaTranslationKey: "ctaFarmPlan",
  },
  "overdue-farm-task-workflow": {
    identifier: "overdue-farm-task-workflow",
    category: "Task",
    destination: "farmPlanContext",
    ctaTranslationKey: "ctaFarmPlan",
  },
  "profile-update-workflow": {
    identifier: "profile-update-workflow",
    category: "Alert",
    destination: "profile",
    ctaTranslationKey: "ctaProfile",
  },
  "farm-owner-manager-joined": {
    identifier: "farm-owner-manager-joined",
    category: "Alert",
    destination: "farmManagers",
    ctaTranslationKey: "ctaFarmManagers",
  },
};

export const NOTIFICATION_CATEGORY_BY_TAG: Record<
  string,
  NotificationCategory
> = {
  reminder: "Reminder",
  task: "Task",
  alert: "Alert",
};

export function isNotificationWorkflow(
  value: string | null | undefined,
): value is NotificationWorkflow {
  if (!value) return false;
  const normalized = value.trim();
  if (!normalized) return false;
  return (WORKFLOW_IDENTIFIERS as readonly string[]).includes(
    normalized as NotificationWorkflow,
  );
}

export function toNotificationWorkflowIdentifier(
  value: string | null | undefined,
): NotificationWorkflow | null {
  if (!value) return null;
  const normalized = value.trim();
  if (!normalized) return null;

  // Try exact match first
  if (isNotificationWorkflow(normalized)) {
    return normalized;
  }

  // Try case-insensitive match
  const lowerValue = normalized.toLowerCase();
  const match = (WORKFLOW_IDENTIFIERS as readonly string[]).find(
    (id) => id.toLowerCase() === lowerValue,
  );

  if (match) {
    return match as NotificationWorkflow;
  }

  // Try fuzzy matching: handle variations like missing "-workflow" suffix
  // or different separators (underscore vs hyphen)
  const fuzzyNormalized = lowerValue
    .replace(/[_\s]+/g, "-") // Normalize separators to hyphens
    .replace(/-+/g, "-") // Remove duplicate hyphens
    .replace(/^-|-$/g, ""); // Trim hyphens from start/end

  // Try matching without the "-workflow" suffix
  const withoutWorkflow = fuzzyNormalized.replace(/-?workflow$/, "");
  const withWorkflow = withoutWorkflow + "-workflow";

  // Check both with and without "-workflow" suffix
  for (const testValue of [fuzzyNormalized, withoutWorkflow, withWorkflow]) {
    const fuzzyMatch = (WORKFLOW_IDENTIFIERS as readonly string[]).find(
      (id) =>
        id.toLowerCase() === testValue ||
        id.toLowerCase().replace(/-?workflow$/, "") === testValue,
    );

    if (fuzzyMatch) {
      console.log(
        `[Workflow Debug] Fuzzy matched "${value}" to "${fuzzyMatch}"`,
      );
      return fuzzyMatch as NotificationWorkflow;
    }
  }

  return null;
}

export function getWorkflowConfig(
  workflowName: string | null | undefined,
): NotificationWorkflowConfig | null {
  if (!isNotificationWorkflow(workflowName)) {
    return null;
  }
  return NOTIFICATION_WORKFLOW_CONFIG[workflowName];
}

export function getWorkflowCategory(
  workflowName: string | null | undefined,
): NotificationCategory | null {
  return getWorkflowConfig(workflowName)?.category ?? null;
}

export function getWorkflowPath(
  workflowName: string | null | undefined,
  locale: string,
  payload?: Record<string, unknown>,
): string | null {
  const config = getWorkflowConfig(workflowName);
  if (!config) {
    return null;
  }
  return DESTINATION_RESOLVERS[config.destination](locale, payload);
}

export function getWorkflowCtaKey(
  workflowName: string | null | undefined,
): NotificationWorkflowCtaKey | null {
  const config = getWorkflowConfig(workflowName);
  if (!config) {
    return null;
  }
  return config.ctaTranslationKey;
}
