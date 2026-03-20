import type { components } from "@cf/api";

// API Response Types
export type APIFarmManagersResponse =
  components["schemas"]["SharedKernelResultOfGetFarmManagersResponse"];
export type APIFarmManagerWithContract =
  components["schemas"]["FarmManagerWithContract"];
export type APIFarmManager = components["schemas"]["FarmManager"];
export type APIContract = components["schemas"]["Contract"];

// UI-specific types for table display
export interface FarmManagerTableRow {
  // API data
  farmManager?: APIFarmManager;
  contract?: APIContract;

  // UI-specific computed fields
  displayName: string;
  displayContact: string;
  displayDate: string;
  assignedLandDisplay: string;

  // UI elements
  uiItem?: JSX.Element;
  uiBadge?: JSX.Element;
}

// Draft table types (if drafts are different from regular managers)
export interface DraftManagerTableRow {
  farmManager: APIFarmManager;
  contract?: APIContract;

  // Computed display fields
  displayName: string;
  displayContact: string;
  displayWorkType: string;
  displayPayType: string;
}

// Helper type for status
export type ContractStatus = APIContract["contractStatus"];
