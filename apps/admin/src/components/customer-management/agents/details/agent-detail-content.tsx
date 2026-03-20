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
  IconChevronDown,
  IconChevronRight,
  IconInfoCircle,
  IconInfoCircleFilled,
  IconLayoutCollage,
  IconLibraryPlus,
  IconPresentationAnalytics,
  IconUserCheck,
  IconUserPlus,
  IconUserX,
} from "@tabler/icons-react";
import { Download, MoreHorizontal } from "lucide-react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import React from "react";

import AgentDetailRightContent from "@/components/customer-management/agents/details/agent-detail-right-content";
import AgentDetailsTab from "@/components/customer-management/agents/details/agent-details-tab";
import AgentGrowersTab from "@/components/customer-management/agents/details/agent-growers-tab";
import AgentOverviewTab from "@/components/customer-management/agents/details/agent-overview-tab";
import AppDetailLayout from "@/components/layout/details/app-detail-layout";
import CustomerDetailLoader from "@/components/skeleton/customer-detail-loader";
import { useApiClient } from "@/lib/api";
import { useModal } from "@/lib/stores/use-modal";
import { STATUSES } from "@/utils/constants/status-constants";
import { filterCustomerDetailActionsByStatus } from "@/utils/helpers/action-filters";
import { UsersAlternative } from "@/utils/svg-icons";

export interface ActionItem {
  icon?: React.ReactNode;
  className?: string;
  actionName: string;
  action: () => void;
}

export default function AgentDetailContent() {
  const t = useTranslations("customerManagement.agents.details");
  const { onOpen } = useModal();
  const api = useApiClient();
  const { id: agentId } = useParams<{ id: string }>();
  const [menuOpened, setMenuOpened] = React.useState(false);

  const { data: response, isPending: isLoadingAgent } = api.useQuery(
    "get",
    "/customer-management/agents/{id}",
    {
      params: {
        path: {
          id: agentId,
        },
      },
    },
    {
      throwOnError: true,
    },
  );

  const agent = response?.data;

  const ACTION_LIST: ActionItem[] = [
    {
      icon: <IconUserX className={"size-4"} />,
      actionName: t("actions.requestSuspension"),
      action: () => {
        //empty
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
    "active",
    (key) => t(key as any),
  );

  const ASSIGN_LIST: ActionItem[] = [
    {
      icon: <IconLayoutCollage className={"size-4"} />,
      actionName: t("actions.assignToFarmland"),
      action: () => {
        onOpen("AssignAgentToFarmland");
      },
    },
  ];

  const hasAlertBanner = agent?.status?.toLowerCase() === STATUSES.deactivated;
  const handleSuspensionReasonClick = () => {
    // empty
  };

  if (isLoadingAgent) {
    return <CustomerDetailLoader />;
  }

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
            label: t("breadcrumbs.agents"),
            href: `/agents`,
            isBackUrl: true,
          },
          {
            label: t("breadcrumbs.details"),
          },
        ]}
        title={agent?.agentName ?? ""}
        status={agent?.status ?? ""}
        toolBar={
          <div className="flex w-full items-center gap-4 sm:w-auto">
            <Button
              size="sm"
              className="text-success-secondary bg-secondary hover:bg-secondary/90 h-10 w-full text-sm font-bold sm:h-9 sm:w-auto"
            >
              <Download size={16} />
              {t("export")}
            </Button>

            <DropdownMenu onOpenChange={setMenuOpened}>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  className="text-success-secondary bg-secondary hover:bg-secondary/90 h-10 w-full text-sm font-bold sm:h-9 sm:w-auto"
                >
                  <IconLibraryPlus size={16} />
                  {t("assign")}
                  <IconChevronDown
                    className={cn(
                      "size-4 transition-transform duration-200",
                      menuOpened && "rotate-180",
                    )}
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 rounded-xl py-1.5"
              >
                {ASSIGN_LIST.map((item, index) => (
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

            {actions.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size={"sm"}
                    className="bg-secondary hover:bg-secondary hover:text-foreground size-7 px-4"
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
            content: <AgentOverviewTab />,
          },
          {
            value: "growers",
            label: t("tabs.growers"),
            iconComponent: UsersAlternative,
            content: <AgentGrowersTab />,
          },
          {
            value: "details",
            label: t("tabs.details"),
            icon: IconInfoCircle,
            content: <AgentDetailsTab agent={agent} />,
          },
        ]}
        defaultValue="overview"
      />

      <AppDetailLayout.Side hasAlertBanner={hasAlertBanner}>
        <AgentDetailRightContent agent={agent} />
      </AppDetailLayout.Side>
    </AppDetailLayout>
  );
}
