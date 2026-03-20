import type { TableMetadata } from "@/types/table-metadata.types";

export interface UserResponse {
  statusCode: number;
  message: string;
  data: {
    pageData: TableMetadata;
    data: User[];
    downloadLink?: string;
  };
}

export interface User {
  id: string;
  email: string;
  authId: string;
  createdAt: string;
  updatedAt: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  isActive: boolean;
  role: string;
  name?: string;
  department: string;
  status: string;
  fullName: string;
}

export interface UserMetricsResponse {
  statusCode: number;
  message: string;
  data: {
    totalStaff: TotalStaff;
    userStatus: UserStatus;
    dateFilters: DateFilter;
    summary: Summary;
  };
}

export interface TotalStaff {
  today: number;
  thisWeek: number;
  thisMonth: number;
  allTime: number;
}

export interface UserStatus {
  active: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    allTime: number;
  };
  pending: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    allTime: number;
  };
  deactivated: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    allTime: number;
  };
}

export interface DateFilter {
  today: string;
  thisWeek: string;
  thisMonth: string;
  allTime: string;
}

export interface Summary {
  totalActiveUsers: number;
  totalPendingUsers: number;
  totalDeactivatedUsers: number;
  overallTotal: number;
}

export interface DepartmentResponse {
  statusCode: number;
  message: string;
  data: Department[];
}

export interface Department {
  name: string;
  roles: string[];
}

export interface RoleResponse {
  statusCode: number;
  message: string;
  data: Role[];
}

export interface Role {
  id: string;
  name: string;
  description: string;
}

export interface AuditLogsResponse {
  statusCode: number;
  message: string;
  data: {
    pageData: {
      totalCount: number;
      pageNo: number;
      pageSize: number;
      totalPages: number;
    };
    data: AuditLog[];
  };
}

export interface AuditLog {
  id: string;
  userId: string;
  activityType: string;
  activityTypeCode: number;
  occurredOnUtc: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserDetailResponse {
  statusCode: number;
  message: string;
  data: User;
}

export interface ExportAllResponse {
  statusCode: number;
  message: string;
  data: {
    downloadLink: string;
  };
}
