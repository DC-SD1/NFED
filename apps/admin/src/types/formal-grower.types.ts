import type { components } from "@cf/api";

import type { TableMetadata } from "@/types/table-metadata.types";

export interface FormalGrowerResponse {
  statusCode: number;
  message: string;
  data: {
    pageData: TableMetadata;
    data: FormalGrower[];
    downloadLink?: string;
  };
}

export interface FormalGrower {
  id: string;
  growerName: string;
  assignedAgent: string;
  country: string;
  region: string;
  village: string;
  email: string;
  phoneNumber: string;
  status: string;
  createdAt: string;
  lastLoginAt?: string;
  isActive: boolean;
  organisationId: string;
  agentId?: string;
  agentEmail?: string;
  agentPhoneNumber?: string;
}

export interface FormalGrowerDetailResponse {
  statusCode: number;
  message: string;
  data: FormalGrower;
}

export type FarmLandItem = components["schemas"]["FarmDetailsResponse"];
