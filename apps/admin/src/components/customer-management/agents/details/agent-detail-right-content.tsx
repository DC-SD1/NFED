"use client";

import { Button } from "@cf/ui";
import {
  IconInfoCircle,
  IconLoader,
  IconMail,
  IconPhoneCall,
} from "@tabler/icons-react";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

import CopyTextButton from "@/components/buttons/copy-text-button";
import DetailRowTile from "@/components/common/detail-row-tile";
import type { AgentDetail } from "@/types/agent.types";
import { STATUS_COLORS } from "@/utils/constants/status-constants";
import { formatTimeAgo } from "@/utils/helpers/date-time-helper";
import { ImageAssets } from "@/utils/image-assets";

interface Props {
  agent?: AgentDetail | null;
}

export default function AgentDetailRightContent({ agent }: Props) {
  const t = useTranslations("customerManagement.agents.details.sideMenu");

  return (
    <div className={"pb-4"}>
      <div className={"flex items-center gap-4"}>
        <Image
          src={ImageAssets.AVATAR_FEMALE}
          alt={"avatar"}
          className={"size-16 rounded-full object-contain"}
        />
        <div>
          <p className={"text-xl font-bold"}>{agent?.agentName ?? ""}</p>
          <p className={"text-secondary-foreground"}>{t("agent")}</p>
        </div>
      </div>
      <div className={"mt-2 flex flex-col"}>
        <DetailRowTile
          title={t("agentId")}
          value={agent?.agentDisplayId ?? ""}
          Icon={IconInfoCircle}
        />
        <DetailRowTile
          title={t("phoneNumber")}
          value={agent?.phoneNumber ?? ""}
          Icon={IconPhoneCall}
          actionButton={
            <CopyTextButton textToCopy={agent?.phoneNumber ?? ""} />
          }
        />
        <DetailRowTile
          title={t("email")}
          value={agent?.email ?? ""}
          Icon={IconMail}
        />
        <DetailRowTile
          title={t("status")}
          value={agent?.status ?? ""}
          Icon={IconInfoCircle}
          valueClassName={STATUS_COLORS[(agent?.status ?? "").toLowerCase()]}
        />
        <DetailRowTile
          title={t("lastActive")}
          value={
            agent?.lastActivity === "N/A"
              ? "N/A"
              : formatTimeAgo(new Date(agent?.lastActivity ?? ""))
          }
          Icon={IconLoader}
        />
      </div>
      <div className={"mt-2 flex justify-center"}>
        <Button
          size={"sm"}
          variant={"secondary"}
          className={
            "text-success-secondary w-full rounded-lg text-sm font-bold"
          }
        >
          {t("viewMore")} <ChevronRight className={"size-6"} />
        </Button>
      </div>
      <hr className={"-mx-6 my-4"} />
      <div>
        <h4 className={"my-4 font-bold"}>{t("activityLogs")}</h4>
        <div className={"flex items-center justify-center py-4"}>
          <p>{t("noActivityLogsFound")}</p>
        </div>
      </div>
    </div>
  );
}
