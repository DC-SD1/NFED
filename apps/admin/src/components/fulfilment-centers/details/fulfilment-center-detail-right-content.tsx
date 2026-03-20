"use client";

import { Button } from "@cf/ui";
import {
  IconExternalLink,
  IconInfoCircle,
  IconMapPin,
  IconPhoneCall,
  IconUser,
  IconWorldPin,
} from "@tabler/icons-react";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

import DetailRowTile from "@/components/common/detail-row-tile";
import type { FulfilmentCenter } from "@/types/fulfilment-centers.types";
import { STATUS_COLORS } from "@/utils/constants/status-constants";
import { ImageAssets } from "@/utils/image-assets";

interface Props {
  center?: FulfilmentCenter | null;
}

export default function FulfilmentCenterDetailRightContent({ center }: Props) {
  const t = useTranslations("fulfillmentCenters.details.info");

  const regionalManager = (center?.managers ?? []).find(
    (manager) => manager.role === "RegionalOperationsManager",
  );
  const operationsDirector = (center?.managers ?? []).find(
    (manager) => manager.role === "OperationsDirector",
  );

  return (
    <div className={"pb-4"}>
      <div className={"flex items-center gap-4"}>
        <Image
          src={
            (center?.photos && center.photos.length > 0
              ? center.photos[0]
              : ImageAssets.CENTER) ?? ImageAssets.CENTER
          }
          alt={"avatar"}
          className={"size-16 rounded-2xl object-cover"}
          width={64}
          height={64}
        />
        <div>
          <p className={"w-64 truncate text-xl font-bold"}>
            {center?.name ?? ""}
          </p>
          <p className={"w-64 truncate text-secondary-foreground"}>
            {center?.locationAddress ?? ""}
          </p>
        </div>
      </div>
      <div className={"mt-2 flex flex-col"}>
        <DetailRowTile
          title={t("phoneNumber")}
          value={center?.phoneNumber ?? ""}
          Icon={IconPhoneCall}
        />
        <DetailRowTile
          title={t("address")}
          value={center?.locationAddress ?? ""}
          Icon={IconMapPin}
          actionButton={
            <a
              href={center?.googleMapLink ?? ""}
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconExternalLink
                className={"size-5 text-secondary-foreground"}
              />
            </a>
          }
          valueClassName={"w-36"}
        />
        <DetailRowTile
          title={t("country")}
          value={center?.country ?? ""}
          Icon={IconWorldPin}
        />
        <DetailRowTile
          title={t("regionalManager")}
          value={regionalManager?.fullName ?? "N/A"}
          Icon={IconUser}
          valueClassName={"w-36"}
        />
        <DetailRowTile
          title={"Operations Director"}
          value={operationsDirector?.fullName ?? "N/A"}
          Icon={IconUser}
          valueClassName={"w-36"}
        />
        <DetailRowTile
          title={t("status")}
          value={"Active"}
          Icon={IconInfoCircle}
          valueClassName={STATUS_COLORS["active".toLowerCase()]}
        />
      </div>
      <div className={"mt-4 flex justify-center"}>
        <Button
          size={"sm"}
          variant={"secondary"}
          className={"text-success-secondary w-full text-sm font-bold"}
        >
          {t("viewDetail")} <ChevronRight className={"size-6"} />
        </Button>
      </div>
      <hr className={"-mx-6 my-4"} />
    </div>
  );
}
