import type { components } from "@cf/api";

import type { TableMetadata } from "@/types/table-metadata.types";

export interface Agent {
  id: string;
  agentName: string;
  assignedRoM: string;
  noOfSMF: string;
  fulfillmentCenter: string;
  email: string;
  phoneNumber: string;
  status: string;
  createdAt: string;
  isActive: boolean;
  expiresAt: string;
}

export interface AgentResponse {
  statusCode: number;
  message: string;
  data: {
    pageData: TableMetadata;
    data: Agent[];
    downloadLink?: string;
  };
}

export interface AgentFarmer {
  id: string;
  name: string;
  growerType: string;
  farm: string;
  fulfilmentCenter: string;
  status: string;
}

export type AgentDetail = components["schemas"]["GetAgentByIdResponse"];
