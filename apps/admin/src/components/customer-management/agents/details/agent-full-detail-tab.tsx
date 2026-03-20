"use client";

import { useTranslations } from "next-intl";

import CopyTextButton from "@/components/buttons/copy-text-button";
import DetailRowTile from "@/components/common/detail-row-tile";
import type { AgentDetail } from "@/types/agent.types";
import { formatTimeAgo } from "@/utils/helpers/date-time-helper";

interface Props {
  agent?: AgentDetail | null;
}

export default function AgentFullDetailTab({ agent }: Props) {
  const t = useTranslations("customerManagement.agents.details.sideMenu");
  return (
    <div className={"flex flex-col px-6 pb-4"}>
      <DetailRowTile title={t("agentId")} value={agent?.agentDisplayId ?? ""} />
      <DetailRowTile title={t("customerType")} value={t("agent")} />
      <DetailRowTile title={t("country")} value={agent?.country ?? ""} />
      <DetailRowTile
        title={t("phoneNumber")}
        value={agent?.phoneNumber ?? ""}
        actionButton={<CopyTextButton textToCopy={agent?.phoneNumber ?? ""} />}
      />
      <DetailRowTile
        title={t("email")}
        value={agent?.email ?? ""}
        actionButton={<CopyTextButton textToCopy={agent?.email ?? ""} />}
      />
      <DetailRowTile
        title={t("assignedRom")}
        value={
          agent?.assignedRoM ?? (
            <div className="bg-secondary rounded-md px-2 py-0.5 text-sm">
              {t("notAssigned")}
            </div>
          )
        }
      />
      <DetailRowTile
        title={t("region")}
        value={
          agent?.region ?? (
            <div className="bg-secondary rounded-md px-2 py-0.5 text-sm">
              {t("notAssigned")}
            </div>
          )
        }
      />
      <DetailRowTile
        title={t("village")}
        value={
          agent?.village ?? (
            <div className="bg-secondary rounded-md px-2 py-0.5 text-sm">
              {t("notAssigned")}
            </div>
          )
        }
      />
      <DetailRowTile
        title={t("community")}
        value={
          agent?.community ?? (
            <div className="bg-secondary rounded-md px-2 py-0.5 text-sm">
              {t("notAssigned")}
            </div>
          )
        }
      />
      <DetailRowTile
        title={t("fulfillmentCenter")}
        value={
          agent?.fulfillmentCenter ?? (
            <div className="bg-secondary rounded-md px-2 py-0.5 text-sm">
              {t("notAssigned")}
            </div>
          )
        }
      />
      <DetailRowTile
        title={"Last activity"}
        value={
          agent?.lastActivity === "N/A"
            ? "N/A"
            : formatTimeAgo(new Date(agent?.lastActivity ?? ""))
        }
      />
      <DetailRowTile
        title={t("status")}
        value={agent?.status ?? ""}
        valueClassName={"text-primary"}
      />
    </div>
  );
}
