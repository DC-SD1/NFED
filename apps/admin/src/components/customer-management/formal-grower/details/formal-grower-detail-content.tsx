"use client";

import {
  Button,
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@cf/ui";
import {
  IconChevronRight,
  IconInfoCircle,
  IconInfoCircleFilled,
  IconPresentationAnalytics,
  IconUserCheck,
  IconUserPlus,
  IconUserX,
} from "@tabler/icons-react";
import { Download, MoreHorizontal } from "lucide-react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import React from "react";

import FormalGrowerDetailsTab from "@/components/customer-management/formal-grower/details/formal-grower-details-tab";
import FormalGrowerOverviewTab from "@/components/customer-management/formal-grower/details/formal-grower-overview-tab";
import GrowerDetailRightContent from "@/components/customer-management/formal-grower/details/grower-detail-right-content";
import AppDetailLayout from "@/components/layout/details/app-detail-layout";
import CustomerDetailLoader from "@/components/skeleton/customer-detail-loader";
import { useApiClient } from "@/lib/api";
import { useModal } from "@/lib/stores/use-modal";
import type { FormalGrowerDetailResponse } from "@/types/formal-grower.types";
import { STATUSES } from "@/utils/constants/status-constants";
import { filterCustomerDetailActionsByStatus } from "@/utils/helpers/action-filters";

export interface ActionItem {
  icon?: React.ReactNode;
  className?: string;
  actionName: string;
  action: () => void;
}

export default function FormalGrowerDetailContent() {
  const { onOpen } = useModal();
  const t = useTranslations("customerManagement.formalGrower.details");
  const api = useApiClient();
  const { id: growerId } = useParams<{ id: string }>();

  const { data: response, isPending: isLoadingGrower } = api.useQuery(
    "get",
    "/customer-management/formal-growers/{id}",
    {
      params: {
        path: {
          id: growerId,
        },
      },
    },
    {
      throwOnError: true,
    },
  );

  const growerResponse = response as any;
  const grower = (growerResponse as FormalGrowerDetailResponse)?.data;

  const ACTION_LIST: ActionItem[] = [
    {
      icon: <IconUserX className={"size-4"} />,
      actionName: t("actions.requestSuspension"),
      action: () => {
        onOpen("RequestToSuspendGrower", {
          formalGrower: grower,
        });
      },
    },
    {
      icon: <IconUserPlus className={"size-4"} />,
      actionName: t("actions.reactivate"),
      action: () => {
        // empty
      },
    },
    {
      icon: <IconUserPlus className={"size-4"} />,
      actionName: t("actions.requestReactivation"),
      action: () => {
        // empty
      },
    },
  ];

  const actions = filterCustomerDetailActionsByStatus(
    ACTION_LIST,
    grower?.status ?? "",
    (key) => t(key as any),
  );

  if (isLoadingGrower) {
    return <CustomerDetailLoader />;
  }

  const hasAlertBanner = grower?.status?.toLowerCase() === STATUSES.suspended;
  const handleSuspensionReasonClick = () => {
    onOpen("GrowerSuspensionReason", {
      formalGrower: grower,
    });
  };

  return (
    <AppDetailLayout>
      <AppDetailLayout.Header
        alertBanner={
          hasAlertBanner && (
            <div
              className={
                "flex flex-col justify-between gap-2 rounded-lg border-[#FFDAD6] bg-[#FFDAD6] px-4 py-2 text-sm text-[#8F0004] sm:flex-row"
              }
            >
              <div className={"flex items-center gap-3"}>
                <IconInfoCircleFilled className={"size-4"} />
                {t("alert.description")}
              </div>
              <div className={"flex items-center gap-4"}>
                <Button
                  onClick={handleSuspensionReasonClick}
                  size={"sm"}
                  variant={"secondary"}
                  className={"text-primary h-8 bg-white font-bold"}
                >
                  {t("alert.reasons")} <IconChevronRight className={"size-4"} />
                </Button>
                <Button
                  size={"sm"}
                  variant={"secondary"}
                  className={"text-primary h-8 bg-white font-bold"}
                >
                  <IconUserCheck className={"size-4"} /> {t("alert.reactivate")}
                </Button>
              </div>
            </div>
          )
        }
        breadcrumbList={[
          {
            label: t("breadcrumbs.formalGrower"),
            href: `/formal-growers`,
            isBackUrl: true,
          },
          {
            label: t("breadcrumbs.details"),
          },
        ]}
        title={grower?.growerName ?? ""}
        status={(grower?.status ?? "").toLowerCase()}
        toolBar={
          <div className="flex w-full items-center gap-4 sm:w-auto">
            <Button
              size="sm"
              className="bg-secondary hover:bg-secondary/90 h-10 w-full text-sm font-bold text-[#1A5514] sm:h-9 sm:w-auto"
            >
              <Download size={16} />
              Export
            </Button>
            {actions.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size={"sm"}
                    className="bg-secondary hover:bg-secondary/90 hover:text-foreground size-7 px-4 hover:bg-[#EDF0E6]"
                  >
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 rounded-xl py-1.5"
                >
                  {actions.map((item, index) => (
                    <DropdownMenuItem
                      className={cn(
                        "focus:bg-btn-hover text-foreground focus:text-foreground flex items-center gap-4",
                        item.className,
                      )}
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        item.action();
                      }}
                    >
                      {item.icon}
                      {item.actionName}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        }
      />

      <AppDetailLayout.Main
        hasAlertBanner={hasAlertBanner}
        tabs={[
          {
            value: "overview",
            label: t("tabs.overview"),
            icon: IconPresentationAnalytics,
            content: <FormalGrowerOverviewTab />,
          },
          {
            value: "details",
            label: t("tabs.details"),
            icon: IconInfoCircle,
            content: <FormalGrowerDetailsTab grower={grower} />,
          },
        ]}
        defaultValue="overview"
      />

      <AppDetailLayout.Side hasAlertBanner={hasAlertBanner}>
        <GrowerDetailRightContent grower={grower} />
      </AppDetailLayout.Side>
    </AppDetailLayout>
  );
}
