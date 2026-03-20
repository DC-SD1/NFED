"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import React from "react";

import AgentFullDetailTab from "@/components/customer-management/agents/details/agent-full-detail-tab";
import AgentKycTab from "@/components/customer-management/agents/details/agent-kyc-tab";
import AgentPaymentInfoTab from "@/components/customer-management/agents/details/agent-payment-info-tab";
import AppTabs from "@/components/tabs/app-tabs";
import type { AgentDetail } from "@/types/agent.types";
import { formatTimeAgo } from "@/utils/helpers/date-time-helper";
import { ImageAssets } from "@/utils/image-assets";

interface Props {
  agent?: AgentDetail | null;
}

export default function AgentDetailsTab({ agent }: Props) {
  const t = useTranslations("customerManagement.agents.details.detailsTab");

  return (
    <div className={"flex flex-col gap-4"}>
      <div
        className={"flex w-full items-center gap-4 rounded-xl border px-6 py-4"}
      >
        <Image
          src={ImageAssets.AVATAR_FEMALE}
          alt={"avatar"}
          className={"size-[84px] rounded-full object-contain"}
        />
        <div>
          <p className={"text-[28px] font-bold"}>{agent?.agentName ?? ""}</p>
          <p className={"text-secondary-foreground"}>{t("agent")}</p>
          <p className={"text-secondary-foreground"}>
            {t("lastActivity")}:{" "}
            {agent?.lastActivity === "N/A"
              ? "N/A"
              : formatTimeAgo(new Date(agent?.lastActivity ?? ""))}
          </p>
        </div>
      </div>
      <div className={"rounded-xl border py-2"}>
        <AppTabs
          tabs={[
            {
              value: "detail",
              label: t("tabs.detail"),
              content: <AgentFullDetailTab agent={agent} />,
            },
            {
              value: "kyc",
              label: t("tabs.kyc"),
              content: <AgentKycTab />,
            },
            {
              value: "payment-info",
              label: t("tabs.paymentInfo"),
              content: <AgentPaymentInfoTab />,
            },
          ]}
          defaultValue={"detail"}
        />
      </div>
    </div>
  );
}
