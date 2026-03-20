"use client";

import {
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@cf/ui";
import {
  IconArrowUpRight,
  IconCash,
  IconChevronDown,
  IconChevronRight,
  IconChevronUp,
  IconClipboardCheck,
  IconListDetails,
  IconLoader,
  IconReceipt,
  IconWallet,
  IconX,
} from "@tabler/icons-react";
import Link from "next/link";
import React, { useState } from "react";

/* ================= TYPES ================= */

type StatAction =
  | { type: "link"; href: string }
  | { type: "dialog"; key: string };

type Stat = {
  title: string;
  value: string;
  icon: any;
  bgColor: string;
  iconColor: string;
  badge?: string | null;
  info?: string;
  action?: StatAction;
};

/* ================= DATA ================= */

export const statsData: Stat[] = [
  {
    title: "Outstanding invoices",
    value: "$1.26M",
    icon: IconLoader,
    bgColor: "bg-blue-100",
    iconColor: "text-blue-600",
    action: { type: "link", href: "/dashboard/statistics/all-invoices" },
  },
  {
    title: "DSO (Days Sales Outstanding)",
    value: "42 days",
    icon: IconReceipt,
    bgColor: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    title: "Payout due this week",
    value: "Ghs 320k",
    icon: IconCash,
    bgColor: "bg-purple-100",
    iconColor: "text-purple-600",
  },
  {
    title: "Refunds in queue",
    value: "$1,200",
    info: "12 requests",
    icon: IconListDetails,
    bgColor: "bg-[#FEF0D8]",
    iconColor: "text-[#995917]",
    action: { type: "link", href: "/dashboard/statistics/all-refunds" },
  },
  {
    title: "Payment success rate",
    value: "96.1%",
    icon: IconClipboardCheck,
    bgColor: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    title: "Payouts",
    value: "$1.26M",
    badge: "-20% this week",
    icon: IconArrowUpRight,
    bgColor: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    title: "Fulfilment Center Wallets",
    value: "24",
    icon: IconWallet,
    bgColor: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    title: "Payments volume",
    value: "300",
    badge: "+20% this week",
    icon: IconReceipt,
    bgColor: "bg-purple-100",
    iconColor: "text-purple-600",
  },
  {
    title: "Fulfilment Center Wallets",
    value: "GHS 1.26M",
    info: "4 fulfilment wallets",
    icon: IconWallet,
    bgColor: "bg-blue-100",
    iconColor: "text-blue-600",
    action: { type: "dialog", key: "wallet-value" },
  },
];


function StatCard({
  stat,
  onClick,
}: {
  stat: Stat;
  onClick?: () => void;
}) {
  const Icon = stat.icon;

  return (
    <Card
      onClick={onClick}
      className="cursor-pointer rounded-xl border bg-white shadow-sm hover:shadow-md transition-shadow"
    >
      <CardContent className="flex h-full flex-col justify-between p-3">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`rounded-lg p-2 ${stat.bgColor} ${stat.iconColor}`}>
                <Icon size={16} />
              </div>
              <span className="text-sm font-medium text-gray-900">
                {stat.title}
              </span>
            </div>

            <IconChevronRight size={16} className="text-gray-400" />
          </div>

          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-gray-900">
              {stat.value}
            </h3>

            {stat.badge && (
              <span
                className={`rounded px-2 py-0.5 text-xs font-medium ${stat.badge.includes("+")
                  ? "bg-green-100 text-green-600"
                  : "bg-red-100 text-red-600"
                  }`}
              >
                {stat.badge}
              </span>
            )}

            {stat.info && (
              <p className="text-xs text-gray-500">{stat.info}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


export default function DashboardStatsCards() {
  const [isOpen, setIsOpen] = useState(true);
  const [activeDialog, setActiveDialog] = useState<string | null>(null);


  return (
    <div className="rounded-xl border p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-4">
        <span className="font-bold">Statistics</span>

        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen((prev) => !prev)}
          className="w-8 border-none p-0 text-gray-400 hover:bg-transparent"
        >
          {isOpen ? (
            <IconChevronUp size={16} className="text-gray-700" />
          ) : (
            <IconChevronDown size={16} className="text-gray-700" />
          )}
        </Button>
      </div>

      {/* Cards */}
      {isOpen && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {statsData.map((stat, index) => {
            if (stat.action?.type === "dialog") {
              return (
                <StatCard
                  key={index}
                  stat={stat}
                  onClick={() => setActiveDialog(stat.action!.key)}
                />
              );
            }

            if (stat.action?.type === "link") {
              return (
                <Link key={index} href={stat.action.href} className="h-full">
                  <StatCard stat={stat} />
                </Link>
              );
            }

            return <StatCard key={index} stat={stat} />;
          })}
        </div>
      )}

      {/* Dialog */}
      <Dialog
        open={activeDialog === "wallet-value"}
        onOpenChange={(open) => !open && setActiveDialog(null)}
      >
        <DialogContent className="gap-0 p-0 sm:max-w-[600px]" closeClassName="hidden">
          <DialogHeader className="relative flex flex-row items-center justify-center border-b p-3">
            <DialogTitle className="sr-only">Choose a fulfilment center</DialogTitle>

            <button
              onClick={() => setActiveDialog(null)}
              className="absolute left-6 outline-none">
              <IconX size={20} className="text-gray-500 hover:text-gray-700" />
            </button>

            <div className="text-black-500 text-lg font-bold tracking-wider">
              Export report
            </div>
          </DialogHeader>

          <div className="flex flex-col gap-6 p-6">
            <Link href={'/dashboard/statistics/fulfilment-centers'} className="border rounded-xl p-4">
              <p className="text-sm font-bold">Juapong fulfilment center</p>
              <span className="text-xs">Eastern region</span>
            </Link>
            <Link href={'/dashboard/statistics/fulfilment-centers'} className="border rounded-xl p-4">
              <p className="text-sm font-bold">Another fulfilment center</p>
              <span className="text-xs">Eastern region</span>
            </Link>
            <Link href={'/dashboard/statistics/fulfilment-centers'} className="border rounded-xl p-4">
              <p className="text-sm font-bold">Cape Coast fulfilment center</p>
              <span className="text-xs">Eastern region</span>
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}