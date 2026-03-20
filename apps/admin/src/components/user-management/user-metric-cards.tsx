"use client";
import { Card, CardContent, CardHeader, CardTitle, cn, Skeleton } from "@cf/ui";
import { IconProgress } from "@tabler/icons-react";
import { Users } from "lucide-react";
import { useTranslations } from "next-intl";

import { useApiClient } from "@/lib/api";
import { useAuthUser } from "@/lib/stores/auth/auth-store-ssr";
import type { UserMetricsResponse } from "@/types/user-management.types";

export default function UserMetricCards() {
  const t = useTranslations("userManagement.userMetrics");
  const api = useApiClient();
  const { userId: authUserId } = useAuthUser();

  const { data: metricsResponse, isLoading: _isLoadingMetrics } = api.useQuery(
    "get",
    "/admin/metrics",
    {},
    {
      enabled: !!authUserId,
    },
  );

  const metrics = (metricsResponse as UserMetricsResponse)?.data;

  const STATUSES = [
    {
      status: t("active"),
      count: metrics?.userStatus?.active?.allTime ?? 0,
      color: "text-[#008744]",
    },
    {
      status: t("pending"),
      count: metrics?.userStatus?.pending?.allTime ?? 0,
      color: "text-[#995917]",
    },
    {
      status: t("deactivated"),
      count: metrics?.userStatus?.deactivated?.allTime ?? 0,
      color: "text-[#8F0004]",
    },
  ];

  return (
    <div className="grid w-full grid-cols-2 gap-4 md:grid-cols-3">
      <Card
        className={
          "col-span-2 w-full rounded-xl border-[#E5E8DF] p-5 md:col-span-1"
        }
      >
        <CardHeader className="flex flex-row items-center gap-5 p-0">
          <div
            className={
              "flex size-[28px] items-center justify-center rounded-md bg-[#EBF3E3]"
            }
          >
            <Users className="size-4 text-[#36B92E]" />
          </div>
          <CardTitle className="text-sm font-normal">
            {t("totalStaff")}
          </CardTitle>
        </CardHeader>
        <CardContent className={"mt-4 flex flex-col gap-4 p-0"}>
          {_isLoadingMetrics ? (
            <Skeleton className="h-8 w-10" />
          ) : (
            <p className="text-3xl font-semibold">
              {metrics?.totalStaff?.allTime ?? 0}
            </p>
          )}
          <p className="text-secondary-foreground text-xs">{t("allTime")}</p>
        </CardContent>
      </Card>

      <Card className={"col-span-2 w-full rounded-xl border-[#E5E8DF] p-5"}>
        <CardHeader className="flex flex-row items-center gap-5 p-0">
          <div
            className={
              "flex size-[28px] items-center justify-center rounded-md bg-[#E2D1FD]"
            }
          >
            <IconProgress className="size-4 text-[#7925CC]" />
          </div>
          <CardTitle className="text-muted-foreground text-sm font-medium">
            {t("userStatus")}
          </CardTitle>
        </CardHeader>

        <CardContent className={"mt-2 p-0"}>
          <div className={"grid grid-cols-3 gap-5"}>
            {STATUSES.map((item, index) => (
              <div
                key={index}
                className={cn(
                  "col-span-1 flex flex-col border-r border-dashed border-r-[#73796E]",
                  index === STATUSES.length - 1 && "border-0",
                )}
              >
                <p className="text-xs">{item.status}</p>
                {_isLoadingMetrics ? (
                  <Skeleton className="h-4 w-8" />
                ) : (
                  <p className={cn("mt-1", item.color)}>{item.count}</p>
                )}
                <p className="text-secondary-foreground mt-3 text-xs">
                  {t("allTime")}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
