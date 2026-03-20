"use client";

import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

import ContentEmptyState from "@/components/common/content-empty-state";
import DetailRowTile from "@/components/common/detail-row-tile";
import KycItemTile from "@/components/customer-management/formal-grower/details/kyc-item-tile";
import KycTabLoader from "@/components/skeleton/kyc-tab-loader";
import { useApiClient } from "@/lib/api";
import { useModal } from "@/lib/stores/use-modal";
import { humanizeLabel, splitCamel } from "@/utils/helpers/common-helpers";
import { ImageAssets } from "@/utils/image-assets";

export default function GrowerKycTab() {
  const t = useTranslations(
    "customerManagement.formalGrower.details.detailsTab.kycTab",
  );
  const api = useApiClient();
  const { id: growerId } = useParams<{ id: string }>();
  const { onOpen } = useModal();

  const {
    data: kycResponse,
    isPending,
    error,
  } = api.useQuery("get", "/kyc/get-kyc", {
    params: {
      query: {
        UserId: growerId,
      },
    },
  });

  const localKycDetails = kycResponse?.value?.details?.grower_local;
  const intlKycDetails = kycResponse?.value?.details?.grower_intl;
  const detailExpire =
    localKycDetails?.passport_expire_date ||
    intlKycDetails?.passport_expire_date;
  const localDocs = kycResponse?.value?.documents?.grower_local_documents || [];
  const intlDocs = kycResponse?.value?.documents?.grower_intl_documents || [];
  const notFound = error?.errors?.[0]?.code === "KYC_SUBMISSION_NOT_FOUND";
  const localDocumentTitles = [
    {
      title: t("idCardTitle"),
      text: t("uploadValidGhanaIDCard"),
    },
    {
      id: t("votersIDOrPassport"),
      title: t("uploadValidPassport"),
    },
  ];
  const intlDocumentTitles = [
    {
      id: t("idPassport"),
      title: t("uploadValidPassport"),
    },
    {
      id: t("visaImageTitle"),
      title: t("uploadAValidVisa"),
    },
  ];

  const { data: preferenceResponse, isPending: isResponsesLoading } =
    api.useQuery("get", "/onboarding/{userId}/responses", {
      params: {
        path: {
          userId: growerId,
        },
      },
    });

  const preference = preferenceResponse?.responses;
  const preferenceData = preference?.data as any;

  const handleViewImage = (fileUrl?: string, title?: string) => {
    if (fileUrl?.toLowerCase().endsWith(".pdf")) {
      window.open(fileUrl, "_blank");
      return;
    }
    onOpen("ImageView", {
      title,
      fileUrl,
    });
  };

  return (
    <div className={"flex flex-col px-6 pb-4"}>
      {notFound ? (
        <div className={"py-6"}>
          <ContentEmptyState
            className={"w-full"}
            imageClassName={"mr-4"}
            imgSrc={ImageAssets.KYC}
            title={t("emptyState.title")}
            message={t("emptyState.description")}
          />
        </div>
      ) : (
        <>
          {isPending ? (
            <KycTabLoader />
          ) : (
            <>
              {isResponsesLoading ? (
                <KycTabLoader />
              ) : (
                <>
                  <div className={"flex flex-col gap-4 py-3"}>
                    <p className={"font-bold"}>{t("preferences")}</p>
                    <hr />
                    <KycItemTile
                      title={t("experienceStatus")}
                      value={
                        typeof preference?.farmingExperience === "string" ? (
                          preference.farmingExperience
                        ) : (
                          <div className="bg-secondary w-fit rounded-md px-2 py-0.5 text-sm">
                            {t("notAssigned")}
                          </div>
                        )
                      }
                      valueClassName={"capitalize"}
                    />
                    <KycItemTile
                      title={t("farmingPreferences")}
                      value={
                        preferenceData?.farmingPreferenceOne ? (
                          splitCamel(preferenceData?.farmingPreferenceOne ?? "")
                        ) : (
                          <div className="bg-secondary w-fit rounded-md px-2 py-0.5 text-sm">
                            {t("notAssigned")}
                          </div>
                        )
                      }
                      valueClassName={"capitalize"}
                    />
                    <KycItemTile
                      title={t("doYouHaveLandYouPlanToUse")}
                      value={
                        preferenceData?.farmingPreferenceTwo ? (
                          splitCamel(preferenceData?.farmingPreferenceTwo ?? "")
                        ) : (
                          <div className="bg-secondary w-fit rounded-md px-2 py-0.5 text-sm">
                            {t("notAssigned")}
                          </div>
                        )
                      }
                      valueClassName={"capitalize"}
                    />
                    <KycItemTile
                      title={t("farmingMethods")}
                      value={
                        preferenceData?.farmingMethod ? (
                          splitCamel(preferenceData?.farmingMethod ?? "")
                        ) : (
                          <div className="bg-secondary w-fit rounded-md px-2 py-0.5 text-sm">
                            {t("notAssigned")}
                          </div>
                        )
                      }
                      valueClassName={"capitalize"}
                    />
                    <KycItemTile
                      title={t("whatsYourMainGoalOnCFGrower")}
                      value={
                        preferenceData?.farmingGoal ? (
                          splitCamel(preferenceData?.farmingGoal ?? "")
                        ) : (
                          <div className="bg-secondary w-fit rounded-md px-2 py-0.5 text-sm">
                            {t("notAssigned")}
                          </div>
                        )
                      }
                      valueClassName={"capitalize"}
                    />
                  </div>

                  <div className={"-mx-6 my-4 h-2 bg-[#F3F7F2]"} />
                </>
              )}

              <div className={"flex flex-col gap-4 py-3"}>
                <p className={"font-bold"}>
                  {t("typeOfResidenceAndDocuments")}
                </p>
                <hr />
                <KycItemTile
                  title={"Type of resident"}
                  value={
                    localKycDetails ? (
                      "Local"
                    ) : intlKycDetails ? (
                      "International"
                    ) : (
                      <div className="bg-secondary rounded-md px-2 py-0.5 text-sm">
                        {t("notAssigned")}
                      </div>
                    )
                  }
                />
                {localKycDetails && localDocs.length === 0 ? (
                  <div className="bg-secondary w-fit rounded-md px-2 py-0.5 text-xs">
                    <p>{t("noLocalDocumentsUploaded")}</p>
                  </div>
                ) : (
                  localDocs.map((localDoc, index) => (
                    <KycItemTile
                      key={index}
                      title={localDocumentTitles[index]?.text || ""}
                      value={humanizeLabel(localDoc?.file_name || "N/A")}
                      valueClassName={"capitalize"}
                      onView={() =>
                        handleViewImage(
                          localDoc?.file_url,
                          localDocumentTitles[index]?.title || "",
                        )
                      }
                    />
                  ))
                )}
                {intlKycDetails && intlDocs.length === 0 ? (
                  <div className="bg-secondary w-fit rounded-md px-2 py-0.5 text-xs">
                    <p>{t("noInternationalDocumentsUploaded")}</p>
                  </div>
                ) : (
                  intlDocs.map((intlDoc, index) => (
                    <KycItemTile
                      key={index}
                      title={intlDocumentTitles[index]?.title || ""}
                      value={humanizeLabel(intlDoc?.file_name || "N/A")}
                      valueClassName={"capitalize"}
                      onView={() =>
                        handleViewImage(
                          intlDoc?.file_url,
                          intlDocumentTitles[index]?.title || "",
                        )
                      }
                    />
                  ))
                )}
                <KycItemTile
                  title={t("idOrPassportExpirationDate")}
                  value={
                    detailExpire ?? (
                      <div className="bg-secondary w-fit rounded-md px-2 py-0.5 text-sm">
                        {t("notAssigned")}
                      </div>
                    )
                  }
                />
                <KycItemTile
                  title={t("proofOfAddress")}
                  value={
                    localKycDetails?.postal_code ||
                    intlKycDetails?.postal_code || (
                      <div className="bg-secondary w-fit rounded-md px-2 py-0.5 text-sm">
                        {t("notAssigned")}
                      </div>
                    )
                  }
                />
                <KycItemTile
                  title={
                    localKycDetails ? t("ghanaPostGPSAddress") : t("address")
                  }
                  value={humanizeLabel(
                    localKycDetails?.proof_of_address_type ||
                      intlKycDetails?.proof_of_address_type ||
                      "",
                  )}
                />
              </div>

              <div className={"-mx-6 my-4 h-2 bg-[#F3F7F2]"} />

              <div className={"flex flex-col gap-4 py-3"}>
                <p className={"font-bold"}>{t("certificationDocuments")}</p>
                <hr />
                <p className="text-secondary-foreground text-sm">
                  {t("notUploadedYet")}
                </p>
              </div>

              <div className={"-mx-6 my-4 h-2 bg-[#F3F7F2]"} />

              <div className={"flex flex-col gap-4 py-2"}>
                <p className={"font-bold"}>{t("kycApprovalDetail")}</p>
                <hr />
                <DetailRowTile
                  title={t("approvedBy")}
                  value={
                    <div className="bg-secondary w-fit rounded-md px-2 py-0.5 text-sm">
                      {t("notAssigned")}
                    </div>
                  }
                />
                <DetailRowTile
                  title={t("approvedDateAndTime")}
                  value={
                    <div className="bg-secondary rounded-md px-2 py-0.5 text-sm">
                      {t("notAssigned")}
                    </div>
                  }
                />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
