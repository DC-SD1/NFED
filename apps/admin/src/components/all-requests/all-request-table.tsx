"use client";

import { Button } from "@cf/ui";
import {
  IconBellRinging,
  IconChevronRight,
  IconFileSearch,
} from "@tabler/icons-react";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import React, { useEffect } from "react";

import StatusBadge from "@/components/common/status-badge";
import {
  DataTableComponent,
  type PaginateData,
  type TableActionItem,
} from "@/components/table/data-table-component";
import TableAction from "@/components/table/table-action";
import useRequestStore from "@/lib/stores/requests-store/requests-store";
import type { UserRequest } from "@/types/all-request.types";
import { STATUSES } from "@/utils/constants/status-constants";
import { ImageAssets } from "@/utils/image-assets";

interface Props<T> {
  data: UserRequest[];
  paginateData: PaginateData<T>;
  tab: "new" | "in-progress" | "rejected" | "completed";
}

export default function AllRequestTable<T>({
  data,
  paginateData,
  tab,
}: Props<T>) {
  const t = useTranslations("allRequests.table");
  const router = useRouter();
  const pathname = usePathname();
  const { setRequestData, reset } = useRequestStore();

  useEffect(() => {
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleReview = (request: UserRequest) => {
    setRequestData(request);
    router.push(`${pathname}/${request.id}/review?step=1`);
  };

  const ACTION_CONFIG: TableActionItem<UserRequest>[] = [
    {
      icon: <IconFileSearch className={"size-4"} />,
      actionName: t("actions.review"),
      action: (row) => {
        handleReview(row.original);
      },
    },
    {
      icon: <IconBellRinging className={"size-4"} />,
      actionName: t("actions.sendReminder"),
      action: (_) => {
        // empty
      },
    },
  ];

  const columns: ColumnDef<UserRequest>[] = [
    {
      accessorKey: "submittedDate",
      header: t("headers.date"),
      cell: ({ row }) =>
        row.original.submittedDate
          ? format(new Date(row.original.submittedDate), "dd MMM yyyy hh:mma")
          : "N/A",
    },
    {
      accessorKey: "requestType",
      header: t("headers.requestType"),
      cell: ({ row }) => (
        <div className={"flex w-full items-center gap-2 text-sm"}>
          <StatusBadge
            status={`${row.original.type} ${row.original.requestType}`}
          />
          {`You have received ${row.original.requestType ?? "a"} request`}
        </div>
      ),
    },
    {
      accessorKey: "userName",
      header: t("headers.requestedBy"),
    },
    {
      accessorKey: "status",
      header: t("headers.status"),
      cell: ({ row }) => {
        return (
          <div className={"flex items-center gap-4"}>
            <StatusBadge status={row.original.status ?? ""} />
            {[STATUSES.inProgress, STATUSES.new].includes(tab) && (
              <Button
                size={"sm"}
                variant={"ghost"}
                onClick={() => handleReview(row.original)}
                className={
                  "text-primary hover:text-primary h-8 hover:bg-transparent"
                }
              >
                {t("actions.review")}
                <IconChevronRight className={"size-4"} />
              </Button>
            )}
            {[STATUSES.completed, STATUSES.rejected].includes(tab) && (
              <Button
                onClick={() => handleReview(row.original)}
                size={"sm"}
                variant={"ghost"}
                className={
                  "h-8 text-[#161D14] hover:bg-transparent hover:text-[#161D14]"
                }
              >
                <IconChevronRight className={"size-4"} />
              </Button>
            )}
          </div>
        );
      },
    },
    ...(tab === STATUSES.inProgress
      ? [
          {
            id: "actions",
            enableHiding: false,
            cell: ({ row }: { row: any }) => {
              return <TableAction actions={ACTION_CONFIG} rowData={row} />;
            },
          },
        ]
      : []),
  ];

  return (
    <>
      <DataTableComponent
        columns={columns}
        data={data}
        paginateData={paginateData}
        emptyStateTitle={
          tab === "new"
            ? t("newTab.emptyState.title")
            : tab === "in-progress"
              ? t("inProgressTab.emptyState.title")
              : tab === "rejected"
                ? t("rejectedTab.emptyState.title")
                : t("completed-tab.emptyState.title")
        }
        emptyStateMessage={
          tab === "new"
            ? t("newTab.emptyState.description")
            : tab === "in-progress"
              ? t("inProgressTab.emptyState.description")
              : tab === "rejected"
                ? t("rejectedTab.emptyState.description")
                : t("completed-tab.emptyState.description")
        }
        hasEmptyStateImage={true}
        emptyStateImgSrc={ImageAssets.ITEM_LIST}
      />
    </>
  );
}
