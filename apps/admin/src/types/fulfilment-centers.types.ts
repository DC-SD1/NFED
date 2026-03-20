import type { components } from "@cf/api";

export const COUNTRIES = [
  { value: "all", label: "All countries" },
  {
    value: "Ghana",
    label: "Ghana",
    code: "GH",
  },
  {
    value: "Togo",
    label: "Togo",
    code: "TG",
  },
];

export interface FarmLand {
  id: string;
  name: string;
  size: string;
  growerName: string;
  assignedAgent: string;
  status: string;
}

export interface CenterAgent {
  id: string;
  name: string;
  size: string;
  noGrowersAssigned: number;
  status: string;
}

export interface CenterManager {
  id: string;
  name: string;
  assignedRole: string;
  status: string;
}

export type FulfilmentCenter = components["schemas"]["FulfillmentCenterDto"];
