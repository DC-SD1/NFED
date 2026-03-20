"use client";

import React, { useMemo } from "react";

import AllRequestTable from "@/components/all-requests/all-request-table";
import TableLoader from "@/components/skeleton/table-loader";
import usePagination from "@/hooks/use-pagingation";
import { useApiClient } from "@/lib/api";
import type { RequestResponseData } from "@/types/all-request.types";

export default function NewRequestContent() {
  const api = useApiClient();
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

  const { data: response, isPending: isLoadingRequests } = api.useQuery(
    "get",
    "/requests",
    {
      params: {
        query: {
          PageNo: pageIndex,
          PageSize: pageSize,
          Status: "New",
        },
      },
    },
    {
      throwOnError: true,
    },
  ) as { data: RequestResponseData; isPending: boolean };

  const requests = response?.data?.data ?? [];
  const metadata = response?.data?.pageData;

  return (
    <div>
      {isLoadingRequests ? (
        <TableLoader showToolbar={false} />
      ) : (
        <AllRequestTable
          data={requests}
          tab={"new"}
          paginateData={{
            pageIndex,
            pagination,
            pageSize,
            currentPage: metadata?.currentPage,
            totalPages: metadata?.totalPages,
            setPagination,
          }}
        />
      )}
    </div>
  );
}
