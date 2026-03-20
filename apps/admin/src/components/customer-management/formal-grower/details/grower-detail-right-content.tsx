"use client";

import { Button } from "@cf/ui";
import {
  IconBuildingWarehouse,
  IconLoader,
  IconMail,
  IconPhoneCall,
  IconProgress,
  IconUserStar,
} from "@tabler/icons-react";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

import CopyTextButton from "@/components/buttons/copy-text-button";
import DetailRowTile from "@/components/common/detail-row-tile";
import GrowerFarmCard from "@/components/customer-management/formal-grower/details/grower-farm-card";
import FormalGrowerFarmLoader from "@/components/skeleton/formal-grower-farm-loader";
import { useApiClient } from "@/lib/api";
import type { FormalGrower } from "@/types/formal-grower.types";
import { STATUS_COLORS } from "@/utils/constants/status-constants";
import { formatTimeAgo } from "@/utils/helpers/date-time-helper";
import { ImageAssets } from "@/utils/image-assets";

interface Props {
  grower?: FormalGrower;
}

export default function GrowerDetailRightContent({ grower }: Props) {
  const t = useTranslations("customerManagement.formalGrower.details.sideMenu");

  const api = useApiClient();
  const { id: growerId } = useParams<{ id: string }>();

  const { data: farmResponse, isLoading } = api.useQuery(
    "get",
    "/farm-management/get-farms",
    {
      params: {
        query: {
          FarmOwnerId: growerId || "",
          PageSize: 2,
        },
      },
    },
    {
      enabled: !!growerId,
      retry: (failureCount, error) => {
        if (error && "status" in error && error.status === 401) return false;
        return failureCount < 3;
      },
    },
  );

  // Extract farms from nested response
  const farms = farmResponse?.data?.data ?? [];
  const farmLands = farmResponse?.data?.data ?? [];

  return (
    <div className={"pb-4"}>
      <div className={"flex items-center gap-4"}>
        <Image
          src={ImageAssets.AVATAR_FEMALE}
          alt={"avatar"}
          className={"size-16 rounded-full object-contain"}
        />
        <div>
          <p className={"text-xl font-bold"}>{grower?.growerName ?? ""}</p>
          <p className={"text-secondary-foreground"}>{t("formalGrower")}</p>
        </div>
      </div>
      <div className={"mt-2 flex flex-col"}>
        <DetailRowTile
          title={t("phone")}
          value={grower?.phoneNumber ?? ""}
          Icon={IconPhoneCall}
          actionButton={
            <CopyTextButton textToCopy={grower?.phoneNumber ?? ""} />
          }
        />
        <DetailRowTile
          title={t("email")}
          value={grower?.email ?? ""}
          Icon={IconMail}
        />
        <DetailRowTile
          title={t("fulfillmentCenter")}
          value={
            <div className="bg-secondary rounded-md px-2 py-0.5 text-sm">
              {t("notAssigned")}
            </div>
          }
          Icon={IconBuildingWarehouse}
        />
        <DetailRowTile
          title={t("assignedRom")}
          value={
            <div className="bg-secondary rounded-md px-2 py-0.5 text-sm">
              {t("notAssigned")}
            </div>
          }
          Icon={IconUserStar}
        />
        <DetailRowTile
          title={t("status")}
          value={grower?.status ?? ""}
          Icon={IconProgress}
          valueClassName={
            STATUS_COLORS[grower?.status?.toLowerCase() ?? ""] ||
            "text-foreground"
          }
        />
        <DetailRowTile
          title={t("lastActive")}
          value={
            grower?.lastLoginAt
              ? formatTimeAgo(new Date(grower?.lastLoginAt ?? ""))
              : "N/A"
          }
          Icon={IconLoader}
        />
        <hr />
      </div>
      <div className={"flex justify-center"}>
        <Button
          size={"sm"}
          className={
            "text-foreground bg-transparent text-sm font-bold hover:bg-transparent"
          }
        >
          {t("viewMore")} <ChevronRight className={"size-6"} />
        </Button>
      </div>
      <hr className={"-mx-6"} />
      <div>
        <div className={"flex gap-4 py-2"}>
          <p className={"font-bold"}>
            {t("activeFarms", { count: farmLands?.length ?? 0 })}
          </p>
        </div>
        <div className={"flex flex-col gap-2"}>
          {isLoading ? (
            <FormalGrowerFarmLoader />
          ) : (
            <>
              {farms.length === 0 ? (
                <p className={"text-secondary-foreground my-4 text-sm"}>
                  No active farm currently.
                </p>
              ) : (
                farms.map((farm) => (
                  <GrowerFarmCard key={farm.farmId} farm={farm} />
                ))
              )}
            </>
          )}
        </div>
        {farms.length > 0 && <hr className={"mt-4"} />}
      </div>
      {/*TODO: ONCE FARM TAB IS READ WE WILL ENABLE THIS*/}
      {/*{farms.length > 0 && (*/}
      {/*  <>*/}
      {/*    <div className={"flex justify-center"}>*/}
      {/*      <Button*/}
      {/*        size={"sm"}*/}
      {/*        className={*/}
      {/*          "text-foreground bg-transparent text-sm font-bold hover:bg-transparent"*/}
      {/*        }*/}
      {/*      >*/}
      {/*        {t("viewAll")} <ChevronRight className={"size-6"} />*/}
      {/*      </Button>*/}
      {/*    </div>*/}
      {/*    <hr className={"-mx-6"} />*/}
      {/*  </>*/}
      {/*)}*/}
    </div>
  );
}
