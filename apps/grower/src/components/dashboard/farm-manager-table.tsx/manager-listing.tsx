// components/farm-manager-table/table.server.tsx
import { Skeleton } from "@cf/ui";
import type { RowSelectionState } from "@tanstack/react-table";
import dynamic from "next/dynamic";
import { Suspense } from "react";

import type { FarmManagerTableRow } from "@/types/farm-manager-item";

const TableClient = dynamic(() => import("./manager-listing.client"), {
  ssr: false,
  loading: () => <TableSkeleton />,
});

interface Props {
  data: (FarmManagerTableRow & { status: string })[];
  pageCount: number;
  showDraftColumns: boolean;
  onRowSelectionChange?: (selection: RowSelectionState) => void;
  exportClicked?: boolean;
  activeFilter?: string;
}

const TableServer = ({
  data,
  pageCount,
  showDraftColumns,
  onRowSelectionChange,
  exportClicked = false,
  activeFilter = "All",
}: Props) => {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <TableClient
        data={data}
        pageCount={pageCount}
        showDraftColumns={showDraftColumns}
        onRowSelectionChange={onRowSelectionChange}
        exportClicked={exportClicked}
        activeFilter={activeFilter}
      />
    </Suspense>
  );
};

const TableSkeleton = () => {
  return (
    <div className="space-y-4 rounded-md border border-gray-200 bg-white p-4 shadow-sm">
      <div className="bg-custom-gray h-5 w-1/3 rounded" />
      {[...Array(5)].map((_, idx) => (
        <div key={idx} className="flex items-center gap-4">
          <Skeleton className="bg-custom-gray h-4 w-6 rounded-full" />
          <Skeleton className="bg-custom-gray h-4 w-1/4 rounded" />
          <Skeleton className="bg-custom-gray h-4 w-1/4 rounded" />
          <Skeleton className="bg-custom-gray h-4 w-1/6 rounded" />
          <Skeleton className="bg-custom-gray h-4 w-1/6 rounded" />
          <Skeleton className="bg-custom-gray h-4 w-1/6 rounded" />
        </div>
      ))}
    </div>
  );
};

export default TableServer;
