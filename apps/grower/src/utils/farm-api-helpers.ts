import type { paths } from "@cf/api";

type GetFarmsResponse =
  paths["/farm-management/get-farms"]["get"]["responses"]["200"]["content"]["application/json"];

export type FarmDetailsResponse = NonNullable<
  NonNullable<GetFarmsResponse["data"]>["data"]
>[number];

export type PaginationMetadata = NonNullable<
  GetFarmsResponse["data"]
>["pageData"];

/**
 * Extracts farm array from nested API response
 *
 * API returns: { statusCode, message, data: { pageData, data: [] } }
 * This extracts: the inner data array
 */
export function extractFarmsData(response: GetFarmsResponse | undefined) {
  return response?.data?.data ?? [];
}

/**
 * Extracts pagination metadata from API response
 */
export function extractPaginationData(response: GetFarmsResponse | undefined) {
  return response?.data?.pageData;
}

/**
 * Farm status enum matching backend
 */
export const FARM_STATUSES = {
  PENDING: "Pending",
  PLANTING: "Planting",
  INACTIVE: "Inactive",
  HARVESTING: "Harvesting",
  ARCHIVED: "Archived",
} as const;

export type FarmStatus = (typeof FARM_STATUSES)[keyof typeof FARM_STATUSES];

/**
 * Farm status filter options for UI
 */
export const FARM_STATUS_FILTERS = [
  { label: "All", value: null },
  { label: "Pending", value: FARM_STATUSES.PENDING },
  { label: "Planting", value: FARM_STATUSES.PLANTING },
  { label: "Harvesting", value: FARM_STATUSES.HARVESTING },
  { label: "Inactive", value: FARM_STATUSES.INACTIVE },
  { label: "Archived", value: FARM_STATUSES.ARCHIVED },
] as const;

/**
 * Numeric status codes to string status mapping
 * Used when backend returns numeric status values
 */
export const NUMERIC_STATUS_MAP = {
  0: FARM_STATUSES.PENDING, // Not started
  1: FARM_STATUSES.PLANTING,
  2: FARM_STATUSES.INACTIVE, // Deactivated
  3: FARM_STATUSES.HARVESTING,
  4: FARM_STATUSES.INACTIVE, // Deactivated
} as const;

/**
 * Status aliases mapping
 * Maps alternative status names to canonical FARM_STATUSES
 */
export const STATUS_ALIASES: Record<string, FarmStatus> = {
  "not started": FARM_STATUSES.PENDING,
  "not-started": FARM_STATUSES.PENDING,
  notstarted: FARM_STATUSES.PENDING,
  deactivated: FARM_STATUSES.INACTIVE,
  cultivating: FARM_STATUSES.PLANTING,
} as const;

/**
 * Status to styling (Tailwind CSS classes) mapping
 */
export const FARM_STATUS_STYLES: Record<
  FarmStatus,
  { className: string; bgColor: string; textColor: string }
> = {
  [FARM_STATUSES.PENDING]: {
    className: "bg-gray-100 text-gray-700",
    bgColor: "bg-gray-100",
    textColor: "text-gray-700",
  },
  [FARM_STATUSES.PLANTING]: {
    className: "bg-blue-100 text-blue-700",
    bgColor: "bg-blue-100",
    textColor: "text-blue-700",
  },
  [FARM_STATUSES.INACTIVE]: {
    className: "bg-yellow-100 text-yellow-700",
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-700",
  },
  [FARM_STATUSES.HARVESTING]: {
    className: "bg-green-100 text-green-700",
    bgColor: "bg-green-100",
    textColor: "text-green-700",
  },
  [FARM_STATUSES.ARCHIVED]: {
    className: "bg-red-100 text-red-700",
    bgColor: "bg-red-100",
    textColor: "text-red-700",
  },
} as const;

/**
 * Unified farm status mapping function
 * Handles string, numeric, and alias inputs
 * Returns canonical status with styling information
 *
 * @param status - Can be string, number, or undefined
 * @returns Object with label, className, and canonical value
 *
 * @example
 * mapFarmStatus("Pending") // { label: "Pending", className: "bg-gray-100 text-gray-700", value: "Pending" }
 * mapFarmStatus(0) // { label: "Pending", className: "bg-gray-100 text-gray-700", value: "Pending" }
 * mapFarmStatus("not started") // { label: "Pending", className: "bg-gray-100 text-gray-700", value: "Pending" }
 * mapFarmStatus("deactivated") // { label: "Inactive", className: "bg-yellow-100 text-yellow-700", value: "Inactive" }
 */
export function mapFarmStatus(
  status: string | number | undefined,
): { label: string; className: string; value: string } | null {
  if (status === undefined || status === null) {
    return {
      label: "Unknown",
      className: "bg-gray-100 text-gray-700",
      value: "Unknown",
    };
  }

  let canonicalStatus: FarmStatus | undefined;

  // Handle numeric status
  if (typeof status === "number") {
    canonicalStatus =
      NUMERIC_STATUS_MAP[status as keyof typeof NUMERIC_STATUS_MAP];
  }
  // Handle string status
  else if (typeof status === "string") {
    const normalizedStatus = status.toLowerCase().trim();

    // Check if it's already a canonical status
    if (Object.values(FARM_STATUSES).includes(status as FarmStatus)) {
      canonicalStatus = status as FarmStatus;
    }
    // Check if it's an alias
    else if (STATUS_ALIASES[normalizedStatus]) {
      canonicalStatus = STATUS_ALIASES[normalizedStatus];
    }
    // Try case-insensitive match with canonical statuses
    else {
      const matchedStatus = Object.values(FARM_STATUSES).find(
        (s) => s.toLowerCase() === normalizedStatus,
      );
      if (matchedStatus) {
        canonicalStatus = matchedStatus;
      }
    }
  }

  // Return result with styling
  if (canonicalStatus && FARM_STATUS_STYLES[canonicalStatus]) {
    return {
      label: canonicalStatus,
      className: FARM_STATUS_STYLES[canonicalStatus].className,
      value: canonicalStatus,
    };
  }

  // Fallback for unknown status
  return {
    label: "Unknown",
    className: "bg-gray-100 text-gray-700",
    value: "Unknown",
  };
}
