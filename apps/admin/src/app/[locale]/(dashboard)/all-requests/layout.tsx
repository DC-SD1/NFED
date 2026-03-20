"use client";

import { cn, useSidebar } from "@cf/ui";
import {
  IconBellRinging,
  IconCircleCheck,
  IconCircleX,
  IconLoader,
} from "@tabler/icons-react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import type { PropsWithChildren } from "react";
import React from "react";

import type { TabLink } from "@/components/tabs/app-tab-links";
import AppTabLink from "@/components/tabs/app-tab-links";
import { getLeftMargin } from "@/utils/helpers/common-helpers";

export default function Layout({ children }: PropsWithChildren) {
  const { state, isMobile: isToggleModal } = useSidebar();
  const leftMargin = getLeftMargin(isToggleModal, state);
  const pathname = usePathname();
  const t = useTranslations("allRequests");

  const tabs: TabLink[] = [
    {
      icon: IconBellRinging,
      label: t("tabs.new"),
      value: "new",
      href: `/all-requests/new`,
    },
    {
      icon: IconLoader,
      label: t("tabs.inProgress"),
      value: "in-progress",
      href: `/all-requests/in-progress`,
    },
    {
      icon: IconCircleX,
      label: t("tabs.rejected"),
      value: "rejected",
      href: `/all-requests/rejected`,
    },
    {
      icon: IconCircleCheck,
      label: t("tabs.completed"),
      value: "completed",
      href: `/all-requests/completed`,
    },
  ];

  const defaultTab = pathname.split("/").pop() || "new";

  const hideLayout = pathname.match(
    /[\dA-Fa-f]{8}(?:-[\dA-Fa-f]{4}){3}-[\dA-Fa-f]{12}/,
  );

  if (hideLayout) {
    return children;
  }

  return (
    <div
      className={cn(
        "fixed inset-x-0 top-20 z-10 px-8 py-1 transition-all duration-200 ease-linear",
        state === "collapsed" && !isToggleModal && "ml-5",
      )}
      style={{ left: leftMargin }}
    >
      <div className={"mb-4"}>
        <h1 className="text-xl font-semibold sm:text-[1.8rem]">
          {t("title", { count: 5 })}
        </h1>
      </div>
      <AppTabLink tabs={tabs} defaultValue={defaultTab}>
        {children}
      </AppTabLink>
    </div>
  );
}
