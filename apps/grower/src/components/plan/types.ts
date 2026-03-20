export type PlanStatus =
  | "Due"
  | "Upcoming"
  | "Due soon"
  | "Overdue"
  | "Draft"
  | "Saved";

export interface PlanRow {
  id: string;
  planName: string;
  farmName: string;
  farmId: string;
  dateCreated: string;
  startDate: string; // ISO or display string
  monthsToGo: string;
  harvestDate: string;
  startFarmingButtonStatus: string;
  status: PlanStatus;
  isSaved?: boolean;
  isDraft?: boolean;
  landId?: string; // NOTE: Not currently in API response - may need backend update
}
