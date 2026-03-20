"use client";

import {
  IconBorderCorners,
  IconChecklist,
  IconClipboard,
  IconClockHour4,
  IconLayoutCollage,
  IconMap2,
  IconMoneybag,
  IconRouteSquare,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import React, { useState } from "react";

import AgentOverviewCard from "@/components/customer-management/agents/details/agent-overview-card";
import AgentOverviewDoubleCard from "@/components/customer-management/agents/details/agent-overview-double-card";
import DateRangePicker from "@/components/input-components/date-range-picker";
import { UsersAlternative } from "@/utils/svg-icons";

export default function AgentOverviewTab() {
  const t = useTranslations("customerManagement.agents.details.overviewTab");

  const [selectedDate, setSelectedDate] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });

  return (
    <div className={"flex flex-col gap-4"}>
      <div>
        <DateRangePicker
          className="rounded-full"
          triggerClassName="w-auto"
          placeholder={t("dateRange")}
          from={selectedDate.from}
          to={selectedDate.to}
          onDateChange={(range) => {
            setSelectedDate({
              from: range.from,
              to: range.to,
            });
          }}
          onClear={() => {
            setSelectedDate({
              from: undefined,
              to: undefined,
            });
          }}
        />
      </div>
      <div className="flex flex-col gap-2">
        <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
          <div className={"col-span-1"}>
            <AgentOverviewDoubleCard
              title={t("totalTasksAssigned")}
              stats={[
                {
                  status: t("completed"),
                  amount: "0",
                },
                {
                  status: t("pending"),
                  amount: "0",
                },
              ]}
              icon={
                <IconClipboard className={"text-secondary-foreground size-4"} />
              }
            />
          </div>
          <div className={"col-span-1"}>
            <AgentOverviewDoubleCard
              title={t("totalFarms")}
              stats={[
                {
                  status: t("underProduction"),
                  amount: "0",
                },
                {
                  status: t("inactive"),
                  amount: "0",
                },
              ]}
              icon={
                <IconLayoutCollage
                  className={"text-secondary-foreground size-4"}
                />
              }
            />
          </div>
        </div>
        <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
          <div className={"col-span-1"}>
            <AgentOverviewDoubleCard
              title={t("commissions")}
              stats={[
                {
                  status: t("paid"),
                  amount: "GHS 0.00",
                },
                {
                  status: t("pending"),
                  amount: "GHS 0.00",
                },
              ]}
              icon={
                <IconMoneybag className={"text-secondary-foreground size-4"} />
              }
            />
          </div>
          <div className={"col-span-1"}>
            <AgentOverviewDoubleCard
              title={t("totalAcres")}
              stats={[
                {
                  status: t("acresMapped"),
                  amount: "0 ac",
                },
                {
                  status: t("avgPerFarm"),
                  amount: "0 ac",
                },
              ]}
              icon={
                <IconBorderCorners
                  className={"text-secondary-foreground size-4"}
                />
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <div className="col-span-1">
            <AgentOverviewCard
              title={t("smallholderFarmers")}
              value="0"
              icon={<UsersAlternative fill={"#525C4E"} size={"16"} />}
            />
          </div>
          <div className="col-span-1">
            <AgentOverviewCard
              title={t("commercialFarmers")}
              value="0"
              icon={<UsersAlternative fill={"#525C4E"} size={"16"} />}
            />
          </div>
          <div className="col-span-1">
            <AgentOverviewCard
              title={t("visitsMade")}
              value="0%"
              icon={<IconMap2 className={"text-secondary-foreground size-4"} />}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <div className="col-span-1">
            <AgentOverviewCard
              title={t("taskCompletionRate")}
              value="0"
              icon={
                <IconChecklist className={"text-secondary-foreground size-4"} />
              }
            />
          </div>
          <div className="col-span-1">
            <AgentOverviewCard
              title={t("avgEscalationResponse")}
              value="0"
              icon={
                <IconClockHour4
                  className={"text-secondary-foreground size-4"}
                />
              }
            />
          </div>
          <div className="col-span-1">
            <AgentOverviewCard
              title={t("routingCapacity")}
              value="0%"
              icon={
                <IconRouteSquare
                  className={"text-secondary-foreground size-4"}
                />
              }
            />
          </div>
        </div>
      </div>
      <hr className={"-mx-8 my-4"} />

      <div>
        <h4 className={"text-xl font-bold"}>{t("agentMapActivities")}</h4>
      </div>
    </div>
  );
}
