import type { TableMetadata } from "@/types/table-metadata.types";

export interface BuyerResponse {
  statusCode: number;
  message: string;
  data: {
    pageData: TableMetadata;
    data: Buyer[];
    downloadLink?: string;
  };
}

export interface Buyer {
  id: string;
  buyerName: string;
  companyName?: string;
  country: string;
  region: string;
  city: string;
  email: string;
  phoneNumber: string;
  status: string;
  createdAt: string;
  lastLoginAt?: string;
  isActive: boolean;
  organisationId: string;
  compliance?: string;
}

export interface BuyerMetricsResponse {
  statusCode: number;
  message: string;
  data: {
    totalBuyers: number;
    totalCountries: number;
    statusCounts: {
      active: number;
      pending: number;
      suspended: number;
      deactivated: number;
    };
  };
}

export interface BuyerDetailResponse {
  statusCode: number;
  message: string;
  data: Buyer;
}
