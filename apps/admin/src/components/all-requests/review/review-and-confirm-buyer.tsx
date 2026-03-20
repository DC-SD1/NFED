"use client";

import { Button } from "@cf/ui";
import {
  IconCircleCheckFilled,
  IconCircleXFilled,
  IconEdit,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";

import useRequestStore from "@/lib/stores/requests-store/requests-store";
import type { KycResponse } from "@/types/all-request.types";
import { humanizeLabel } from "@/utils/helpers/common-helpers";

interface Props {
  onCorporateUpdate?: () => void;
  onAuthUpdate?: () => void;
  onFinance?: () => void;
}

export default function ReviewAndConfirmBuyer({
  onCorporateUpdate,
  onAuthUpdate,
  onFinance,
}: Props) {
  const t = useTranslations("allRequests.reviewKyc");
  const kycResponse = useRequestStore.use.kycResponse();
  const kycData = kycResponse as KycResponse;
  const corpIdentity = kycData.value?.documents?.corp_identity || [];
  const finance = kycData.value?.documents?.finance || [];
  const authRep = kycData.value?.documents?.auth_rep || [];
  const isKycPending = kycData.value?.kycStatus === "Submitted";

  return (
    <div className={"flex flex-col gap-[26px] p-10"}>
      <h1 className={"text-lg font-bold sm:text-2xl"}>
        {t("tabs.reviewAndConfirm")}
      </h1>
      <div className={"w-full rounded-xl border px-5 pb-2"}>
        <div className={"flex items-center justify-between py-3"}>
          <p className={"font-bold"}>{t("tabs.corporateIdentity")}</p>
          {isKycPending && (
            <Button
              onClick={onCorporateUpdate}
              size={"sm"}
              variant={"ghost"}
              className={
                "text-primary hover:text-primary h-8 hover:bg-transparent"
              }
            >
              <IconEdit className={"size-3"} />
              {t("update")}
            </Button>
          )}
        </div>
        <hr className={"mb-2"} />
        {corpIdentity.map((identity, index) => (
          <div key={index} className={"flex items-center gap-4 py-1.5"}>
            {identity.document_status === "Accepted" ? (
              <IconCircleCheckFilled className={"size-4 text-[#008744]"} />
            ) : (
              <IconCircleXFilled className={"size-4 text-[#BA1A1A]"} />
            )}
            <p className={"text-sm"}>
              {humanizeLabel(identity.file_name || "N/A")}
            </p>
          </div>
        ))}
      </div>

      <div className={"w-full rounded-xl border px-5 pb-2"}>
        <div className={"flex items-center justify-between py-3"}>
          <p className={"font-bold"}>{t("tabs.authorizedRepresentative")}</p>
          {isKycPending && (
            <Button
              onClick={onAuthUpdate}
              size={"sm"}
              variant={"ghost"}
              className={
                "text-primary hover:text-primary h-8 hover:bg-transparent"
              }
            >
              <IconEdit className={"size-3"} />
              {t("update")}
            </Button>
          )}
        </div>
        <hr className={"mb-2"} />
        {authRep.map((rep, index) => (
          <div key={index} className={"flex items-center gap-4 py-1.5"}>
            {rep.document_status === "Accepted" ? (
              <IconCircleCheckFilled className={"size-4 text-[#008744]"} />
            ) : (
              <IconCircleXFilled className={"size-4 text-[#BA1A1A]"} />
            )}
            <p className={"text-sm"}>{humanizeLabel(rep.file_name || "N/A")}</p>
          </div>
        ))}
      </div>

      <div className={"w-full rounded-xl border px-5 pb-2"}>
        <div className={"flex items-center justify-between py-3"}>
          <p className={"font-bold"}>
            {t("tabs.financialStandingAndLiquidity")}
          </p>
          {isKycPending && (
            <Button
              onClick={onFinance}
              size={"sm"}
              variant={"ghost"}
              className={
                "text-primary hover:text-primary h-8 hover:bg-transparent"
              }
            >
              <IconEdit className={"size-3"} />
              {t("update")}
            </Button>
          )}
        </div>
        <hr className={"mb-2"} />
        {finance.map((fin, index) => (
          <div key={index} className={"flex items-center gap-4 py-1.5"}>
            {fin.document_status === "Accepted" ? (
              <IconCircleCheckFilled className={"size-4 text-[#008744]"} />
            ) : (
              <IconCircleXFilled className={"size-4 text-[#BA1A1A]"} />
            )}
            <p className={"text-sm"}>{humanizeLabel(fin.file_name || "N/A")}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
