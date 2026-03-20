import type { GanttFeature, GanttStatus } from "@cf/ui/components/gantt";

export interface ActivityUI {
  id: string;
  stage: string;
  activity: string;
  duration: string;
  costRange: string;
  startWeek: string;
  endWeek: string;
  color: string;
  startDateISO?: string;
  endDateISO?: string;
}

// Generate colors for gantt statuses
function generateStatusColor(index: number): string {
  const colors = [
    "#DBEAFE", // Blue
    "#FEF3C7", // Yellow
    "#EDE9FE", // Purple
    "#DCFCE7", // Green
    "#FEE2E2", // Red
    "#F3E8FF", // Indigo
    "#FCE7F3", // Pink
    "#ECFDF5", // Emerald
    "#FFF7ED", // Orange
    "#F0F9FF", // Sky
  ];
  return colors[index % colors.length]!;
}

// Create gantt statuses dynamically based on actual activity stages
export function getDynamicGanttStatuses(
  activities: ActivityUI[],
): GanttStatus[] {
  if (!activities?.length) return getDefaultGanttStatuses();

  // Extract unique stages, preserve order of first occurrence
  const uniqueStages = Array.from(
    new Map(
      activities.filter((a) => a.stage.trim()).map((a) => [a.stage, a.stage]),
    ).values(),
  );

  // If no stages found, fall back to defaults
  if (uniqueStages.length === 0) {
    return getDefaultGanttStatuses();
  }

  return uniqueStages.map((stage, index) => ({
    id: stage.toLowerCase().replace(/[^a-z0-9]/g, "-"),
    name: stage,
    color: generateStatusColor(index),
  }));
}

// Fallback for backward compatibility
export function getDefaultGanttStatuses(): GanttStatus[] {
  return [
    { id: "pre-planting", name: "Pre-Planting", color: "#DBEAFE" },
    { id: "nursery", name: "Nursery Management", color: "#FEF3C7" },
    { id: "transplanting", name: "Transplanting", color: "#EDE9FE" },
  ];
}

export function statusForStage(
  stage: string,
  statuses: GanttStatus[],
): GanttStatus {
  // Find exact match by name first
  const exactMatch = statuses.find((s) => s.name === stage);
  if (exactMatch) return exactMatch;

  // Find by generated ID as fallback
  const stageId = stage.toLowerCase().replace(/[^a-z0-9]/g, "-");
  const idMatch = statuses.find((s) => s.id === stageId);
  if (idMatch) return idMatch;

  // Ultimate fallback to first status
  return statuses[0] ?? { id: "unknown", name: "Unknown", color: "#E5E7EB" };
}

export function toGanttFeatures(
  activities: ActivityUI[],
  statuses: GanttStatus[],
  baseStartDateISO?: string,
): GanttFeature[] {
  const base = baseStartDateISO ? new Date(baseStartDateISO) : new Date();
  return activities.map((a) => {
    const startAt = a.startDateISO
      ? new Date(a.startDateISO)
      : new Date(base.getTime());
    const endAt = a.endDateISO
      ? new Date(a.endDateISO)
      : new Date(base.getTime());

    if (!a.startDateISO) {
      startAt.setDate(startAt.getDate() + (parseInt(a.startWeek) - 1) * 7);
    }
    if (!a.endDateISO) {
      endAt.setDate(endAt.getDate() + parseInt(a.endWeek) * 7 - 1);
    }

    const status = statusForStage(a.stage, statuses);

    return {
      id: a.id,
      name: a.activity,
      startAt,
      endAt,
      status: { ...status, color: a.color }, // Use activity's color override
      lane: a.stage,
    };
  });
}

export function groupFeatures(
  features: GanttFeature[],
  statuses: GanttStatus[],
) {
  return statuses
    .map((status) => ({
      status,
      features: features.filter((f) => f.status.id === status.id),
    }))
    .filter((g) => g.features.length > 0);
}
