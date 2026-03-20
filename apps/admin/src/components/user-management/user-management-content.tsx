"use client";

import { Button } from "@cf/ui";
import { Download, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import React, { useEffect, useMemo, useState } from "react";

import AppTitleToolBar from "@/components/layout/app-title-tool-bar";
import TableLoader from "@/components/skeleton/table-loader";
import UserManagementTable from "@/components/user-management/user-management-table";
import UserMetricCards from "@/components/user-management/user-metric-cards";
import { useDebounce } from "@/hooks/use-debounce";
import usePagination from "@/hooks/use-pagingation";
import { useApiClient } from "@/lib/api";
import useTableStore from "@/lib/stores/table-store/table-store";
import { useModal } from "@/lib/stores/use-modal";
import type {
  DepartmentResponse,
  RoleResponse,
  UserResponse,
} from "@/types/user-management.types";
import { EXPORT_TYPES } from "@/utils/constants/status-constants";

import UserManagementTableToolbar from "./user-management-table-toolbar";

export default function UserManagementContent() {
  const { onOpen } = useModal();
  const t = useTranslations("userManagement");
  const api = useApiClient();
  const { exportType, setExportType } = useTableStore();
  const [selectedFilters, setSelectedFilters] = useState({
    department: "all",
    role: "all",
    status: "all",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm);

  const [{ pageIndex, pageSize }, setPagination] = usePagination({
    pageIndex: 1,
    pageSize: 10,
  });

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize],
  );

  const { data: response, isPending: isLoadingUsers } = api.useQuery(
    "get",
    "/admin/dashboard/users",
    {
      params: {
        query: {
          PageNo: pageIndex,
          PageSize: pageSize,
          ...(debouncedSearchTerm !== "" && {
            SearchTerm: debouncedSearchTerm,
          }),
          ...(selectedFilters.role !== "all" && {
            Role: selectedFilters.role,
          }),
          ...(selectedFilters.department !== "all" && {
            Department: selectedFilters.department,
          }),
          ...(selectedFilters.status !== "all" && {
            Status: selectedFilters.status.toUpperCase(),
          }),
          ...(exportType &&
            exportType?.type === EXPORT_TYPES.itemsMatchingAppliedFilters && {
              Export: true,
            }),
        },
      },
    },
    {
      throwOnError: true,
    },
  );

  const userResponse = response as UserResponse;
  const users = userResponse?.data?.data ?? [];
  const metadata = userResponse?.data?.pageData;

  const { data: departmentResponse, isPending: isLoadingDepartments } =
    api.useQuery("get", "/admin/departments") as {
      data: DepartmentResponse;
      isPending: boolean;
    };

  const DEPARTMENTS = [
    { value: "all", label: "All departments" },
    ...(departmentResponse?.data ?? []).map((department) => ({
      value: department.name,
      label: department.name,
    })),
  ];

  const { data: roleResponse, isPending: isLoadingRoles } = api.useQuery(
    "get",
    "/admin/roles",
  ) as { data: RoleResponse; isPending: boolean };

  const ROLES = [
    { value: "all", label: "All role" },
    ...(roleResponse?.data ?? []).map((role) => ({
      value: role.id,
      label: role.name,
    })),
  ];

  useEffect(() => {
    if (userResponse?.data?.downloadLink && !isLoadingUsers) {
      setExportType({
        ...exportType,
        isFilteringData: isLoadingUsers,
        downloadUrl: userResponse?.data?.downloadLink,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoadingUsers, userResponse?.data?.downloadLink]);

  return (
    <div>
      <AppTitleToolBar
        title={t("pageTitle")}
        toolBar={
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Button
              size="sm"
              onClick={() => {
                onOpen("ExportList", {
                  exportName: "users",
                });
              }}
              className="bg-secondary hover:bg-secondary/90 h-12 text-sm text-[#1A5514] sm:h-9"
            >
              <Download size={16} />
              {t("exportButton")}
            </Button>
            <Button
              onClick={() => {
                onOpen("InviteUser");
              }}
              size="sm"
              className="h-12 text-sm sm:h-9"
            >
              <Plus size={16} />
              {t("inviteUserButton")}
            </Button>
          </div>
        }
      />
      <div className={"mt-2"}>
        <UserMetricCards />
      </div>
      <div className={"mt-8"}>
        {isLoadingUsers ? (
          <TableLoader />
        ) : (
          <UserManagementTable
            data={users}
            paginateData={{
              pageIndex,
              pagination,
              pageSize,
              currentPage: metadata?.currentPage,
              totalPages: metadata?.totalPages,
              setPagination,
            }}
            toolBar={
              <UserManagementTableToolbar
                departments={DEPARTMENTS}
                roles={ROLES}
                isLoadingDepartments={isLoadingDepartments}
                isLoadingRoles={isLoadingRoles}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                selectedFilters={selectedFilters}
                setSelectedFilters={setSelectedFilters}
              />
            }
            isFiltering={
              selectedFilters.department !== "all" ||
              selectedFilters.role !== "all" ||
              selectedFilters.status !== "all" ||
              debouncedSearchTerm !== ""
            }
          />
        )}
      </div>
    </div>
  );
}
