"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import ApprovalTileItem from "@/components/all-requests/review/approval-tile-item";
import { useApiClient } from "@/lib/api";
import useRequestStore from "@/lib/stores/requests-store/requests-store";
import { useModal } from "@/lib/stores/use-modal";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toast";
import type { KycResponse } from "@/types/all-request.types";
import { humanizeLabel } from "@/utils/helpers/common-helpers";

// eslint-disable-next-line max-lines-per-function
export default function ResidenceAndDocuments() {
  const t = useTranslations("allRequests.reviewKyc");
  const tt = useTranslations("common.errors");
  const api = useApiClient();
  const queryClient = useQueryClient();
  const {
    requestData,
    kycResponse,
    setDocumentStatus,
    setDocumentDeclineReason,
    setDetailStatus,
  } = useRequestStore();
  const { onOpen } = useModal();
  const kycData = kycResponse as KycResponse;
  const localKycDetails = kycData.value?.details?.grower_local;
  const intlKycDetails = kycData.value?.details?.grower_intl;
  const detailExpire =
    localKycDetails?.passport_expire_date ||
    intlKycDetails?.passport_expire_date;
  const localDocs = kycData.value?.documents?.grower_local_documents || [];
  const intlDocs = kycData.value?.documents?.grower_intl_documents || [];
  const isKycPending = kycData.value?.kycStatus === "Submitted";

  const { mutate, isPending } = api.useMutation(
    "put",
    "/kyc/update-document-status",
    {
      onSuccess: async (_, variables) => {
        await queryClient.invalidateQueries({
          queryKey: ["get", "/kyc/get-kyc"],
        });
        showSuccessToast(
          `${variables.body.status === "Accepted" ? t("mainContent.approved") : t("mainContent.declined")}`,
        );
      },
      onError: (error: any) => {
        const errorMessage = error?.errors
          ?.map((err: any) => err.message)
          .join(", ");
        showErrorToast(errorMessage ?? tt("unknown_error"));
      },
    },
  );

  const { mutate: mutateDetail, isPending: detailPending } = api.useMutation(
    "put",
    "/kyc/update-details",
    {
      onSuccess: async (_, variables) => {
        await queryClient.invalidateQueries({
          queryKey: ["get", "/kyc/get-kyc"],
        });
        const detail =
          variables.body.details?.grower_local ??
          variables.body.details?.grower_intl;
        showSuccessToast(
          `${detail?.details_status === "Accepted" ? t("mainContent.approved") : t("mainContent.declined")}`,
        );
      },
      onError: (error: any) => {
        const errorMessage = error?.errors
          ?.map((err: any) => err.message)
          .join(", ");
        showErrorToast(errorMessage ?? tt("unknown_error"));
      },
    },
  );

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

  const handleUpdateDocument = (
    documentName: string,
    status: string,
    message?: string | null,
  ) => {
    mutate({
      body: {
        userId: requestData?.userId,
        documentName,
        status,
        message,
      },
    });
  };

  const handleUpdateDetail = (status: string) => {
    const details = kycData.value?.details;
    mutateDetail({
      body: {
        userId: requestData?.userId,
        details: {
          grower_local:
            details?.grower_local?.proof_of_address_type &&
            details?.grower_local?.passport_expire_date
              ? {
                  ...details?.grower_local,
                  details_status: status,
                }
              : null,
          grower_intl:
            details?.grower_intl?.proof_of_address_type &&
            details?.grower_intl?.passport_expire_date
              ? {
                  ...details?.grower_intl,
                  details_status: status,
                }
              : null,
        } as any,
      },
    });
  };

  return (
    <div className={"flex flex-col gap-[26px] p-10"}>
      <h1 className={"text-lg font-bold sm:text-2xl"}>
        {t("tabs.typeOfResidenceAndDocuments")}
      </h1>
      <ApprovalTileItem
        title={t("mainContent.typeOfResidence")}
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
        noAction={true}
      />

      {localDocs.map((localDoc, index) => (
        <ApprovalTileItem
          key={index}
          title={""}
          value={humanizeLabel(localDoc?.file_name || "N/A")}
          onViewClick={() =>
            handleViewImage(localDoc?.file_url, localDoc?.file_name || "")
          }
          onApproveClick={() => {
            handleUpdateDocument(localDoc?.file_name ?? "", "Accepted");
          }}
          onDeclineClick={() => {
            setDocumentStatus(
              "grower_local_documents",
              localDoc?.file_name ?? "",
              "Required",
            );
          }}
          status={(localDoc?.document_status || "").toLowerCase()}
          onReasonChange={(reason) => {
            setDocumentDeclineReason(
              "grower_local_documents",
              localDoc?.file_name ?? "",
              reason,
            );
          }}
          onDeclineCancelClick={() => {
            setDocumentStatus(
              "grower_local_documents",
              localDoc?.file_name ?? "",
              "Pending",
            );
          }}
          onDeclineSaveClick={() => {
            handleUpdateDocument(
              localDoc?.file_name ?? "",
              "Declined",
              localDoc?.status_error_message,
            );
          }}
          onChangeClick={() => {
            setDocumentStatus(
              "grower_local_documents",
              localDoc?.file_name ?? "",
              "Pending",
            );
          }}
          reason={localDoc?.status_error_message ?? ""}
          isLoading={isPending || detailPending}
          kycStatus={kycData.value?.kycStatus}
          noAction={!isKycPending}
        />
      ))}

      {intlDocs.map((intlDoc, index) => (
        <ApprovalTileItem
          key={index}
          title={""}
          value={humanizeLabel(intlDoc?.file_name || "N/A")}
          onViewClick={() =>
            handleViewImage(intlDoc?.file_url, intlDoc?.file_name || "")
          }
          onApproveClick={() => {
            handleUpdateDocument(intlDoc?.file_name ?? "", "Accepted");
          }}
          onDeclineClick={() => {
            setDocumentStatus(
              "grower_intl_documents",
              intlDoc?.file_name ?? "",
              "Required",
            );
          }}
          status={(intlDoc?.document_status || "").toLowerCase()}
          onReasonChange={(reason) => {
            setDocumentDeclineReason(
              "grower_intl_documents",
              intlDoc?.file_name ?? "",
              reason,
            );
          }}
          onDeclineCancelClick={() => {
            setDocumentStatus(
              "grower_intl_documents",
              intlDoc?.file_name ?? "",
              "Pending",
            );
          }}
          onDeclineSaveClick={() => {
            handleUpdateDocument(
              intlDoc?.file_name ?? "",
              "Declined",
              intlDoc?.status_error_message,
            );
          }}
          onChangeClick={() => {
            setDocumentStatus(
              "grower_intl_documents",
              intlDoc?.file_name ?? "",
              "Pending",
            );
          }}
          reason={intlDoc?.status_error_message ?? ""}
          isLoading={isPending || detailPending}
          kycStatus={kycData.value?.kycStatus ?? ""}
          noAction={!isKycPending}
        />
      ))}

      {localKycDetails?.passport_expire_date && (
        <ApprovalTileItem
          title={t("mainContent.idOrPassportExpirationDate")}
          value={
            detailExpire ?? (
              <div className="bg-secondary w-fit rounded-md px-2 py-0.5 text-sm">
                {t("notAssigned")}
              </div>
            )
          }
          onApproveClick={() => handleUpdateDetail("Accepted")}
          onDeclineClick={() => {
            setDetailStatus("grower_local", "Required");
          }}
          status={(localKycDetails?.details_status || "").toLowerCase()}
          onReasonChange={(reason) => {
            setDetailStatus("grower_local", "Required", reason);
          }}
          onDeclineCancelClick={() => {
            setDetailStatus("grower_local", "Pending");
          }}
          onDeclineSaveClick={() => handleUpdateDetail("Declined")}
          onChangeClick={() => {
            setDetailStatus("grower_local", "Pending");
          }}
          reason={localKycDetails?.status_error_message ?? ""}
          isLoading={isPending || detailPending}
          kycStatus={kycData.value?.kycStatus ?? ""}
          noAction={!isKycPending}
        />
      )}
      {intlKycDetails?.passport_expire_date && (
        <ApprovalTileItem
          title={t("mainContent.idOrPassportExpirationDate")}
          value={
            detailExpire ?? (
              <div className="bg-secondary w-fit rounded-md px-2 py-0.5 text-sm">
                {t("notAssigned")}
              </div>
            )
          }
          onApproveClick={() => handleUpdateDetail("Accepted")}
          onDeclineClick={() => {
            setDetailStatus("grower_intl", "Required");
          }}
          status={(intlKycDetails?.details_status || "").toLowerCase()}
          onReasonChange={(reason) => {
            setDetailStatus("grower_intl", "Required", reason);
          }}
          onDeclineCancelClick={() => {
            setDetailStatus("grower_intl", "Pending");
          }}
          onDeclineSaveClick={() => handleUpdateDetail("Declined")}
          onChangeClick={() => {
            setDetailStatus("grower_intl", "Pending");
          }}
          reason={intlKycDetails?.status_error_message ?? ""}
          isLoading={isPending || detailPending}
          kycStatus={kycData.value?.kycStatus ?? ""}
          noAction={!isKycPending}
        />
      )}
      <ApprovalTileItem
        title={
          localKycDetails
            ? t("mainContent.ghanaPostGPSAddress")
            : t("mainContent.address")
        }
        value={humanizeLabel(
          localKycDetails?.proof_of_address_type ||
            intlKycDetails?.proof_of_address_type ||
            "",
        )}
        noAction={true}
      />
      <ApprovalTileItem
        title={t("mainContent.proofOfAddress")}
        value={
          localKycDetails?.postal_code ||
          intlKycDetails?.postal_code || (
            <div className="bg-secondary w-fit rounded-md px-2 py-0.5 text-sm">
              {t("notAssigned")}
            </div>
          )
        }
        noAction={true}
      />
    </div>
  );
}
