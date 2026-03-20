import type { ColumnDef } from "@tanstack/react-table";

import type {
  APIFarmManagerWithContract,
  DraftManagerTableRow,
  FarmManagerTableRow,
} from "@/types/farm-manager-item";
import { mapFarmStatus as unifiedMapFarmStatus } from "@/utils/farm-api-helpers";

/**
 * Maps API farm manager data to table display format
 */
export const mapFarmManagerToTableRow = (
  data: APIFarmManagerWithContract[],
): FarmManagerTableRow[] => {
  return data.map((item) => {
    const { farmManager, contract, farms } = item;

    return {
      farmManager,
      contract,

      // Computed display fields
      displayName:
        `${farmManager?.firstName || ""} ${farmManager?.lastName || ""}`.trim(),
      displayContact:
        farmManager?.emailAddress || farmManager?.phoneNumber || "N/A",
      displayDate: contract?.startDate
        ? formatDate(contract.startDate)
        : "Not assigned",
      assignedLandDisplay:
        farms?.length === 1
          ? farms[0]?.name ?? "N/A"
          : farms && farms.length > 0
            ? `${farms[0]?.name ?? "N/A"} + ${farms.length - 1}`
            : "N/A",
      displayPayType: contract?.paymentType || "Not specified",
      displayWorkType: contract?.contractType || "Not specified",

      // UI elements would be set by the component using this data
      uiItem: undefined,
      uiBadge: undefined,
    };
  });
};

/**
 * Maps draft farm managers (without contracts) to table display format
 */
export const mapDraftManagerToTableRow = (
  data: APIFarmManagerWithContract[],
): DraftManagerTableRow[] => {
  return data
    .filter(
      (item) => !item.contract || item.contract.contractStatus === "Draft",
    )
    .map((item) => {
      const { farmManager, contract } = item;

      if (!farmManager) {
        throw new Error("Farm manager data is required for draft rows");
      }

      return {
        farmManager,
        contract,

        // Computed display fields
        displayName:
          `${farmManager.firstName || ""} ${farmManager.lastName || ""}`.trim(),
        displayContact:
          farmManager.emailAddress || farmManager.phoneNumber || "N/A",
        displayWorkType: "",
        displayPayType: "",

        // UI elements would be set by the component using this data
        uiItem: undefined,
        uiBadge: undefined,
      };
    });
};

/**
 * Formats an ISO date string to a display format
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);

  // Check for bad date
  if (isNaN(date.getTime())) {
    return "Invalid date";
  }

  // Format as DD MMMM YYYY
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Gets the display status for a contract
 */
export function getContractStatusDisplay(status?: string): string {
  if (!status) return "Not assigned";

  const statusMap: Record<string, string> = {
    draft: "Draft",
    assigned: "Assigned",
    active: "Active",
    terminated: "Deactivated",
    deactivated: "Deactivated",
    unassigned: "Not assigned",
  };

  return statusMap[status.toLowerCase()] || status;
}

export function getPaymentTypeDisplay(paymentType?: string): string {
  if (!paymentType) return "Not specified";
  const paymentTypeMap: Record<string, string> = {
    payroll: "Paid via payroll",
    equityyield: "Take equity of the yield",
    hybrid: "Hybrid of cash and equity",
  };
  return paymentTypeMap[paymentType.toLowerCase()] || paymentType;
}

export function getWorkTypeDisplay(workType?: string): string {
  if (!workType) return "Not specified";
  const workTypeMap: Record<string, string> = {
    fulltime: "Full-Time",
    contractor: "Contractor",
  };
  return workTypeMap[workType.toLowerCase()] || workType;
}

// inside TableClient (or extract to utils)
interface CSVColumn<T> {
  header: string;
  accessor: (item: T) => string | number | null | undefined;
}

export const getCSVColumns = (columns: ColumnDef<any>[]): CSVColumn<any>[] => {
  return columns
    .filter((col) => col.id !== "actions" && col.id !== "item") // remove HTML-based columns
    .map((col) => {
      const header = typeof col.header === "string" ? col.header : col.id ?? "";

      let accessor: (row: any) => string | number | null | undefined;

      if (col.id === "badge") {
        accessor = (row) => row.status ?? "";
      } else if (isAccessorFnColumn(col)) {
        accessor = col.accessorFn;
      } else if ("accessorKey" in col && col.accessorKey) {
        accessor = (row: any) => row[col.accessorKey as string];
      } else {
        accessor = () => "";
      }

      return {
        header,
        accessor,
      };
    });
};

// Type guard for accessorFn column
function isAccessorFnColumn(
  col: ColumnDef<any>,
): col is ColumnDef<any> & { accessorFn: (row: any) => any } {
  return typeof (col as any).accessorFn === "function";
}

export const getStatusColorClass = (status: string): string => {
  switch (status.toLowerCase()) {
    case "assigned":
      return "text-primary";
    case "draft":
      return "text-gray-600";
    case "unassigned":
      return "text-yellow-dark";
    case "deactivated":
      return "text-red-dark";
    case "terminated":
      return "text-red-dark";
    default:
      return "text-gray-600";
  }
};

export const formatDisplayValue = (value: string): string => {
  if (value === "-" || isNaN(Number(value))) {
    return value;
  }
  return Number(value).toFixed(2);
};

export const getCropDisplayName = (cropValue: string): string => {
  const cropDisplayMap: Record<string, string> = {
    ginger: "Ginger",
    cowpea: "Cowpea",
    "chilli-pepper": "Chilli pepper",
    maize: "Maize",
    soybean: "Soybean",
    pineapple: "Pineapple",
    mango: "Mango",
    cassava: "Cassava",
    sesame: "Sesame",
    groundnut: "Groundnut",
    "sweet-potatoes": "Sweet potatoes",
    other: "Other",
  };

  return cropDisplayMap[cropValue] || cropValue;
};

export const getFarmingExperienceLabel = (value?: string): string => {
  const experienceMap: Record<string, string> = {
    experienced: "Experienced",
    newbie: "Newbie",
  };
  return value ? experienceMap[value] || value : "-";
};

export const getFarmingMethodLabel = (value?: string): string => {
  const methodMap: Record<string, string> = {
    openfield: "Open field farming",
    greenhouse: "Green house",
    notSure: "I'm not sure",
  };
  return value ? methodMap[value] || value : "-";
};
export const educationLevelMap: Record<string, string> = {
  noFormal: "No formal",
  basic: "Basic",
  secondary: "Secondary",
  tertiary: "Tertiary",
  bachelors: "Bachelors",
  masters: "Masters",
};

export const experienceLabelToValue = (label: string): string => {
  const labelMap: Record<string, string> = {
    lessThanOneYear: "Less than 1 year",
    oneToThreeYears: "1-3 years",
    fourToSevenYears: "4-7 years",
    moreThanEightYears: "8+ years",
    fiveToTenYears: "5-10 years",
  };

  return labelMap[label] || label;
};

export interface FarmStatusResponse {
  value: number;
}
/**
 * Maps farm status to display format with styling
 * @deprecated This function now uses the unified mapping from farm-api-helpers.ts
 * Consider importing mapFarmStatus directly from farm-api-helpers.ts instead
 */
export function mapFarmStatus(
  status?: string,
): { label: string; className: string } | null {
  return unifiedMapFarmStatus(status);
}
