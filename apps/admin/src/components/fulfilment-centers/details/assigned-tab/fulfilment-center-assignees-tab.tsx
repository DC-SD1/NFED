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
  IconLayoutCollage,
  IconPlant2,
  IconPlus,
  IconStar,
  IconUserCog,
  IconUserOff,
  IconUsers,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import React from "react";

import FulfilmentCenterAgentTab from "@/components/fulfilment-centers/details/assigned-tab/fulfilment-center-agent-tab";
import FulfilmentCenterFarmlandTab from "@/components/fulfilment-centers/details/assigned-tab/fulfilment-center-farmland-tab";
import FulfilmentCenterManagerTab from "@/components/fulfilment-centers/details/assigned-tab/fulfilment-center-manager-tab";
import type { ActionItem } from "@/components/fulfilment-centers/details/fulfilment-center-detail-content";
import AppTabs from "@/components/tabs/app-tabs";
import { UsersAlternative } from "@/utils/svg-icons";

export default function FulfilmentCenterAssigneesTab() {
  const t = useTranslations("fulfillmentCenters.details");
  const [selectTab, setSelectTab] = React.useState("farmland");
  const [menuOpened, setMenuOpened] = React.useState(false);

  const ASSIGN_LIST: ActionItem[] = [
    {
      icon: <IconUserCog className={"size-4"} />,
      actionName: t("actions.assignRegionalManager"),
      action: () => {
        // empty
      },
    },
    {
      icon: <IconUserCog className={"size-4"} />,
      actionName: t("actions.assignOperationDirector"),
      action: () => {
        // empty
      },
    },
    {
      icon: <IconUserCog className={"size-4"} />,
      actionName: t("actions.assignWarehouseManager"),
      action: () => {
        // empty
      },
    },
    {
      icon: <IconUserCog className={"size-4"} />,
      actionName: t("actions.assignFieldAgronomist"),
      action: () => {
        // empty
      },
    },
    {
      icon: <IconUserCog className={"size-4"} />,
      actionName: t("actions.assignFieldCoordinators"),
      action: () => {
        // empty
      },
    },
  ];

  return (
    <div className={"relative flex flex-col gap-6"}>
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="flex flex-col gap-2 rounded-xl border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
            <div className="flex size-6 items-center justify-center rounded-full bg-orange-100 text-orange-500">
              <IconStar size={14} fill="currentColor" />
            </div>
            Growers
          </div>
          <span className="text-2xl font-bold">4,234</span>
        </div>
        <div className="flex flex-col gap-2 rounded-xl border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
            <div className="flex size-6 items-center justify-center rounded-full bg-green-100 text-green-500">
              <IconPlant2 size={14} />
            </div>
            Assigned Agents
          </div>
          <span className="text-2xl font-bold">762</span>
        </div>
        <div className="flex flex-col gap-2 rounded-xl border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
            <div className="flex size-6 items-center justify-center rounded-full bg-blue-100 text-blue-500">
              <IconUsers size={14} />
            </div>
            Managers
          </div>
          <span className="text-2xl font-bold">4</span>
        </div>
        <div className="flex flex-col gap-2 rounded-xl border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
            <div className="flex size-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-500">
              <IconUserOff size={14} />
            </div>
            Unmatched
          </div>
          <span className="text-2xl font-bold">220</span>
        </div>
      </div>

      <div className="flex items-center justify-between pb-0">
        <AppTabs
          className={"w-auto rounded-xl bg-[#F7F9F8] p-1.5"}
          triggerClassName={
            "h-10 px-4 rounded-lg data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=inactive]:bg-transparent data-[state=inactive]:text-gray-500 font-medium data-[state=active]:border-0"
          }
          tabs={[
            {
              icon: IconLayoutCollage,
              value: "farmland",
              label: "Farmlands",
              content: null,
            },
            {
              iconComponent: UsersAlternative,
              value: "agent",
              label: "Agents",
              content: null,
            },
            {
              icon: IconUserCog,
              value: "managers",
              label: "Managers",
              content: null,
            },
          ]}
          defaultValue={selectTab}
          onTabChanged={setSelectTab}
        />

        <div className="mb-1.5">
          {selectTab === "managers" ? (
            <DropdownMenu onOpenChange={setMenuOpened}>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  variant="secondary"
                  className="text-success-secondary bg-success-light hover:bg-success-light/90 h-9 px-4 text-sm font-bold"
                >
                  <IconPlus className={"mr-2 size-4"} />
                  Add managers
                  <IconChevronDown
                    className={cn(
                      "ml-2 size-4 transition-transform duration-200",
                      menuOpened && "rotate-180",
                    )}
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-64 rounded-xl py-1.5"
              >
                {ASSIGN_LIST.map((item, index) => (
                  <DropdownMenuItem
                    className={cn(
                      "focus:bg-btn-hover flex items-center gap-4 py-3 text-foreground focus:text-foreground",
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
          ) : (
            <Button
              variant={"secondary"}
              size="sm"
              className={
                "text-success-secondary h-9 bg-[#EBF7EB] px-4 text-sm font-bold hover:bg-[#EBF7EB]/90"
              }
            >
              <IconPlus className={"mr-2 size-4"} />
              Add {selectTab === "farmland" ? "farmland" : selectTab}
            </Button>
          )}
        </div>
      </div>

      <div className="mt-0">
        {selectTab === "farmland" && <FulfilmentCenterFarmlandTab />}
        {selectTab === "agent" && <FulfilmentCenterAgentTab />}
        {selectTab === "managers" && <FulfilmentCenterManagerTab />}
      </div>
    </div>
  );
}
