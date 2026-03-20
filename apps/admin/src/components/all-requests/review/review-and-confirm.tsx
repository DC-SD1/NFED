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
  onCertificateUpdate?: () => void;
  onResidentUpdate?: () => void;
}

export default function ReviewAndConfirm({
  onCertificateUpdate,
  onResidentUpdate,
}: Props) {
  const t = useTranslations("allRequests.reviewKyc");
  const kycResponse = useRequestStore.use.kycResponse();
  const kycData = kycResponse as KycResponse;
  const localKycDetails = kycData.value?.details?.grower_local;
  const detail =
    kycData.value?.details?.grower_local ?? kycData.value?.details?.grower_intl;
  const localDocs = kycData.value?.documents?.grower_local_documents || [];
  const intlDocs = kycData.value?.documents?.grower_intl_documents || [];
  const certification = kycData.value?.documents?.certification;
  const isKycPending = kycData.value?.kycStatus === "Submitted";

  return (
    <div className={"flex flex-col gap-[26px] p-10"}>
      <div className={"w-full rounded-xl border px-5"}>
        <div className={"flex items-center justify-between py-3"}>
          <p className={"font-bold"}>{t("tabs.typeOfResidenceAndDocuments")}</p>
          {isKycPending && (
            <Button
              onClick={onResidentUpdate}
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
        <div className={"flex items-center gap-4 py-1.5"}>
          {detail?.details_status === "Accepted" ? (
            <IconCircleCheckFilled className={"size-4 text-[#008744]"} />
          ) : (
            <IconCircleXFilled className={"size-4 text-[#BA1A1A]"} />
          )}
          <p className={"text-sm"}>{t("mainContent.typeOfResidence")}</p>
        </div>

        {localDocs.map((localDoc, index) => (
          <div key={index} className={"flex items-center gap-4 py-1.5"}>
            {localDoc.document_status === "Accepted" ? (
              <IconCircleCheckFilled className={"size-4 text-[#008744]"} />
            ) : (
              <IconCircleXFilled className={"size-4 text-[#BA1A1A]"} />
            )}
            <p className={"text-sm"}>
              {humanizeLabel(localDoc.file_name || "N/A")}
            </p>
          </div>
        ))}
        {intlDocs.map((intlDoc, index) => (
          <div key={index} className={"flex items-center gap-4 py-1.5"}>
            {intlDoc.document_status === "Accepted" ? (
              <IconCircleCheckFilled className={"size-4 text-[#008744]"} />
            ) : (
              <IconCircleXFilled className={"size-4 text-[#BA1A1A]"} />
            )}
            <p className={"text-sm"}>
              {humanizeLabel(intlDoc.file_name || "N/A")}
            </p>
          </div>
        ))}

        <div className={"flex items-center gap-4 py-1.5"}>
          {detail?.details_status === "Accepted" ? (
            <IconCircleCheckFilled className={"size-4 text-[#008744]"} />
          ) : (
            <IconCircleXFilled className={"size-4 text-[#BA1A1A]"} />
          )}
          <p className={"text-sm"}>
            {t("mainContent.idOrPassportExpirationDate")}
          </p>
        </div>
        <div className={"flex items-center gap-4 py-1.5"}>
          {detail?.details_status === "Accepted" ? (
            <IconCircleCheckFilled className={"size-4 text-[#008744]"} />
          ) : (
            <IconCircleXFilled className={"size-4 text-[#BA1A1A]"} />
          )}
          <p className={"text-sm"}>{t("mainContent.proofOfAddress")}</p>
        </div>
        <div className={"mb-2 flex items-center gap-4 py-1.5"}>
          {detail?.details_status === "Accepted" ? (
            <IconCircleCheckFilled className={"size-4 text-[#008744]"} />
          ) : (
            <IconCircleXFilled className={"size-4 text-[#BA1A1A]"} />
          )}
          <p className={"text-sm"}>
            {localKycDetails
              ? t("mainContent.ghanaPostGPSAddress")
              : t("mainContent.address")}
          </p>
        </div>
      </div>

      <div className={"w-full rounded-xl border px-5 pb-2"}>
        <div className={"flex items-center justify-between py-3"}>
          <p className={"font-bold"}>{t("tabs.certificates")}</p>
          {isKycPending && (
            <Button
              onClick={onCertificateUpdate}
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
        {certification ? (
          <div className={"flex items-center gap-4 py-1.5"}>
            {certification.document_status === "Accepted" ? (
              <IconCircleCheckFilled className={"size-4 text-[#008744]"} />
            ) : (
              <IconCircleXFilled className={"size-4 text-[#BA1A1A]"} />
            )}
            <p className={"text-sm"}>Uploaded certificates</p>
          </div>
        ) : (
          <div className="bg-secondary mb-4 w-fit rounded-md px-2 py-0.5 text-xs">
            <p>{t("mainContent.noCertificatesUploaded")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
