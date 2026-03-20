"use client";

// disable-eslint
import { Skeleton } from "@cf/ui";
import * as React from "react";

import { useApiClient } from "@/lib/api";
import { useAuthUser } from "@/lib/stores/auth/auth-store-ssr";
import { cn } from "@/lib/utils";

interface StatsGridProps {
  className?: string;
}

export function StatsGrid({ className }: StatsGridProps) {
  const api = useApiClient();
  const { userId: authUserId } = useAuthUser();

  const { data: orderMetrics, isPending } = api.useQuery(
    "get",
    "/order/get-metrics",
    {
      params: {
        query: {
          UserId: authUserId ?? "",
        },
      },
    },
  );

  const { data: pendingOrderMetrics, isPending: isPendingPendingOrders } =
    api.useQuery("get", "/order/get-metrics", {
      params: {
        query: {
          UserId: authUserId ?? "",
          Status: "Pending",
        },
      },
    });

  const { data: completedOrderMetrics, isPending: isPendingCompletedOrders } =
    api.useQuery("get", "/order/get-metrics", {
      params: {
        query: {
          UserId: authUserId ?? "",
          Status: "Completed",
        },
      },
    });

  const { data: canceledOrderMetrics, isPending: isPendingCanceledOrders } =
    api.useQuery("get", "/order/get-metrics", {
      params: {
        query: {
          UserId: authUserId ?? "",
          Status: "Canceled",
        },
      },
    });

  const statsData = [
    {
      id: "total-orders",
      value: orderMetrics ?? 0,
      label: "Total orders",
      isHighlighted: true,
      subItems: [
        { label: "Available crops", value: 0 },
        { label: "Personalized cultivation", value: 0 },
      ],
    },
    {
      id: "pending-orders",
      value: pendingOrderMetrics ?? 0,
      label: "PENDING ORDERS",
      subItems: [
        { label: "Available crops", value: 0 },
        { label: "Personalized cultivation", value: 0 },
      ],
    },
    {
      id: "completed-orders",
      value: completedOrderMetrics ?? 0,
      label: "COMPLETED ORDERS",
      subItems: [
        { label: "Available crops", value: 0 },
        { label: "Personalized cultivation", value: 0 },
      ],
    },
    {
      id: "canceled-orders",
      value: canceledOrderMetrics ?? 0,
      label: "CANCELED ORDERS",
      subItems: [
        { label: "Available crops", value: 0 },
        { label: "Personalized cultivation", value: 0 },
      ],
    },
  ];

  if (
    isPending ||
    isPendingPendingOrders ||
    isPendingCompletedOrders ||
    isPendingCanceledOrders
  ) {
    return (
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-4 xl:grid-cols-4">
        {[0, 1, 2, 3].map((idx) => (
          <div
            key={idx}
            className={cn(
              "rounded-xl p-6",
              idx === 0
                ? "from-0 via-55 to-100 bg-[#F5F5F5] bg-gradient-to-tr from-[hsl(var(--text-dark))] via-[#00554A] to-[#4B908B]"
                : "bg-[#F5F5F5]",
            )}
          >
            <div className="space-y-2">
              <Skeleton
                className={cn(
                  "h-9 w-28",
                  idx === 0 ? "bg-[#f5f5f5]" : undefined,
                )}
              />
              <Skeleton
                className={cn(
                  "h-4 w-32",
                  idx === 0 ? "bg-[#f5f5f5]" : undefined,
                )}
              />
            </div>
            <div className="space-y-2 pt-7">
              <Skeleton
                className={cn(
                  "h-3 w-40",
                  idx === 0 ? "bg-[#f5f5f5]" : undefined,
                )}
              />
              <Skeleton
                className={cn(
                  "h-3 w-48",
                  idx === 0 ? "bg-[#f5f5f5]" : undefined,
                )}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-4 xl:grid-cols-4",
        className,
      )}
    >
      {statsData.map((stat) => (
        <div
          key={stat.id}
          className={cn(
            "rounded-xl p-6",
            stat.isHighlighted
              ? "from-0 via-55 to-100 bg-[#F5F5F5] bg-gradient-to-tr from-[hsl(var(--text-dark))] via-[#00554A] to-[#4B908B] text-[#6EFFE5]"
              : "bg-[#F5F5F5] text-black",
          )}
        >
          <h3 className="text-[36px] font-bold">{stat.value as number}</h3>
          <p
            className={cn(
              "text-sm uppercase md:font-normal",
              stat.isHighlighted ? "text-white" : "text-[#586665]",
            )}
          >
            {stat.label}
          </p>
          {stat.subItems && stat.subItems.length > 0 && (
            <div
              className="space-y-1 pt-7 text-sm"
              style={{ color: stat.isHighlighted ? "#FFFFFF" : "#586665" }}
            >
              {stat.subItems.map((subItem) => (
                <p key={subItem.label}>
                  {subItem.value} {subItem.label}
                </p>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
