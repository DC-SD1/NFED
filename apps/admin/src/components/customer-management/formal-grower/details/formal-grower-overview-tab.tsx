"use client";

import {
  IconAlertTriangle,
  IconCalendarCheck,
  IconChartHistogram,
  IconClipboardCheck,
  IconGrowth,
  IconSeeding,
  IconTrendingUp,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import React, { useState } from "react";

import GrowerOverviewCard from "@/components/customer-management/formal-grower/details/grower-overview-card";
import DateRangePicker from "@/components/input-components/date-range-picker";

export default function FormalGrowerOverviewTab() {
  const t = useTranslations(
    "customerManagement.formalGrower.details.overviewTab",
  );

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
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <div className="col-span-1">
            <GrowerOverviewCard
              title={t("taskCompletionRate")}  
              value="82%"
              subTitle="Tasks completed on time"
              icon={IconClipboardCheck}
            />
          </div>
          <div className="col-span-1">
            <GrowerOverviewCard
              title={t("agronomyVisits")}
              value="5%"
              subTitle="Inspections & agronomy support"
              icon={IconGrowth}
            />
          </div>
          <div className="col-span-1">
            <GrowerOverviewCard
              title={t("escalations")}
              value="7%"
              subTitle="Issues raised this season"
              icon={IconAlertTriangle}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className="col-span-1">
            <GrowerOverviewCard
              title={t("farmProductivityScore")}
              value="82%"
              subTitle={t("tasksCompletedOnTime")}
              icon={IconTrendingUp}
            />
          </div>
          <div className="col-span-1">
            <GrowerOverviewCard
              title={t("currentCropPhase")}
              value="5%"
              subTitle={t("inspectionsAndAgronomySupport")}
              icon={IconSeeding}
            />
          </div>
          <div className="col-span-1">
            <GrowerOverviewCard
              title={t("reportFrequency")}
              value="82%"
              subTitle={t("tasksCompletedOnTime")}
              icon={IconCalendarCheck}
            />
          </div>
          <div className="col-span-1">
            <GrowerOverviewCard
              title={t("yieldInsights")}
              value="5%"
              subTitle={t("inspectionsAndAgronomySupport")}
              icon={IconChartHistogram}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
