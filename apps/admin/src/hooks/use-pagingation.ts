"use client";

import type { PaginationState } from "@tanstack/react-table";
import { useState } from "react";

const defaultPaginationState: PaginationState = {
  pageIndex: 1,
  pageSize: 10,
};

const usePagination = (
  initialState: PaginationState = defaultPaginationState,
) => {
  const [pagination, setPagination] = useState<PaginationState>(initialState);

  return [pagination, setPagination] as const;
};

export default usePagination;
