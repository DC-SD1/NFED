/* eslint-disable max-lines-per-function */
"use client";

import { Button, FormInput } from "@cf/ui";
import { FormDateInput } from "@cf/ui/components/form-date-time";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { useApiClient } from "@/lib/api";
import { useGetKyc } from "@/lib/queries/kyc-query";
import { idDocumentSchema } from "@/lib/schemas/farm-manager-details";
import { useAuthUser } from "@/lib/stores/auth-store-ssr";
import type { DocumentUploadResponse } from "@/lib/stores/upload-store";
import { useModal } from "@/lib/stores/use-modal";
import {
  getFileNameFromUrl,
  handlePostCodeInput,
} from "@/lib/utils/string-helpers";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toast";

import ResidentEditKycSkeleton from "../dashboard/skeletons/resident-edit-skeleton";
import FileCard from "../documents-kyc-card";
import type { IdDocumentFormData } from "./resident-kyc-submit";

interface DocumentItem {
  file_url: string;
  file_type: number;
  file_name: string;
  uploaded_date: string;
}

interface UpdatedKycData {
  expirationDate?: string;
  ghanaPostCode?: string;
  proofOfAddressType?: string;
}

export default function ResidentEditKyc() {
  const t = useTranslations("dashboard.kyc.residentType");
  const tOther = useTranslations("dashboard.kyc");
  const { onOpen } = useModal();
  const api = useApiClient();
  const router = useRouter();
  const [isDraft, setIsDraft] = useState(true);
  const [updatedDocuments, setUpdatedDocuments] = useState<
    Record<string, DocumentUploadResponse>
  >({});

  const { userId: authId } = useAuthUser();

  const { kycData: kycResponse, isLoading, error, refetch } = useGetKyc();

  const residentKYC = kycResponse?.value || null;
  const localDocs = residentKYC?.documents?.grower_local_documents || [];
  const kycDetails = residentKYC?.details;

  const methods = useForm<IdDocumentFormData>({
    resolver: zodResolver(idDocumentSchema),
    defaultValues: {
      expirationDate: kycDetails?.grower_local?.passport_expire_date || "",
      ghanaPostCode: kycDetails?.grower_local?.postal_code || "0000",
    },
  });

  const { control, setValue, handleSubmit, watch, reset } = methods;

  const watchedExpirationDate = watch("expirationDate");
  const watchedGhanaPostCode = watch("ghanaPostCode");

  const updatedKycData: UpdatedKycData = useMemo(() => {
    const originalExpirationDate =
      kycDetails?.grower_local?.passport_expire_date || "";
    const originalGhanaPostCode =
      kycDetails?.grower_local?.postal_code || "0000";

    const changes: UpdatedKycData = {};

    changes.expirationDate =
      watchedExpirationDate !== originalExpirationDate
        ? watchedExpirationDate
        : originalExpirationDate;
    changes.ghanaPostCode =
      watchedGhanaPostCode !== originalGhanaPostCode
        ? watchedGhanaPostCode
        : originalGhanaPostCode;
    return changes;
  }, [watchedExpirationDate, watchedGhanaPostCode, kycDetails]);

  const updateDocumentsMutation = api.useMutation(
    "put",
    "/kyc/update-documents",
    {
      onSuccess: async () => {
        showSuccessToast("Documents updated successfully!");
        await refetch();
        router.push("/profile");
      },
      onError: (error: any) => {
        if (
          error?.errors?.some(
            (err: any) =>
              err.code === "KYC_DOCUMENTS_INVALID" ||
              err.message?.includes(
                "Cannot update documents for non-draft submissions",
              ),
          )
        ) {
          showErrorToast(
            "You can only update documents for draft submissions. Please try again after draft submission.",
          );
          return;
        }
        showErrorToast("Failed to update documents. Please try again.");
      },
    },
  );

  const submitMutation = api.useMutation("post", "/kyc/submit", {
    onSuccess: () => {
      showSuccessToast("KYC information submitted successfully!");
      router.push("/profile");
    },
    onError: () => {
      showErrorToast("Failed to submit KYC information. Please try again.");
    },
  });

  const updateDetailsMutation = api.useMutation("put", "/kyc/update-details", {
    onSuccess: async () => {
      showSuccessToast("KYC details updated successfully!");
      await refetch();
    },
    onError: (error: any) => {
      if (
        error?.errors?.some(
          (err: any) =>
            err.code === "KYC_DETAILS_INVALID" ||
            err.message?.includes(
              "Cannot update details for non Grower KYC type",
            ),
        )
      ) {
        showErrorToast(
          "You can only update details for Grower KYC type. Please try again with the correct KYC type.",
        );
        return;
      }
      showErrorToast("Failed to update KYC details. Please try again.");
    },
  });

  const categorizedDocs = {
    primaryId: localDocs.find((doc) => doc.file_name === "identity"),
    secondaryId: localDocs.find(
      (doc) => doc.file_name === "secondary_identity",
    ),
    proofOfAddress: localDocs.find(
      (doc) => doc.file_name === "proof_of_address",
    ),
  };

  const getProofOfAddressType = (
    filename: string,
  ): "ghana_post_code" | "utility_bill" | "bank_statement" => {
    if (filename === "proof_of_address") {
      return "utility_bill";
    }
    return "ghana_post_code";
  };
  const onRemove = (
    docType: "proofOfAddress" | "id" | "passport" | "visa" | undefined,
    proofOfAddressType?: "ghana_post_code" | "utility_bill" | "bank_statement",
  ) => {
    onOpen("UpdateKycDocuments", {
      uploadDocType: docType,
      proofOfAddressType,
      currentExpirationDate: watchedExpirationDate,
      currentGhanaPostCode: watchedGhanaPostCode,
      onDocumentUploaded: (
        documentType: string,
        documentData: DocumentUploadResponse,
      ) => {
        setUpdatedDocuments((prev) => ({
          ...prev,
          [documentType]: documentData,
        }));
      },
      onKycDataUpdated: (kycData: UpdatedKycData) => {
        if (kycData.expirationDate !== undefined) {
          setValue("expirationDate", kycData.expirationDate);
        }
        if (kycData.ghanaPostCode !== undefined) {
          setValue("ghanaPostCode", kycData.ghanaPostCode);
        }
      },
    });
  };

  const hasAnyDocuments =
    categorizedDocs.primaryId ||
    categorizedDocs.secondaryId ||
    categorizedDocs.proofOfAddress ||
    Object.keys(updatedDocuments).length > 0;

  const hasAnyChanges =
    Object.keys(updatedDocuments).length > 0 ||
    Object.keys(updatedKycData).length > 0;

  const buildFinalDocuments = () => {
    const nowIso = new Date().toISOString();
    const existingDocuments = residentKYC?.documents || {
      corp_identity: [],
      finance: [],
      auth_rep: [],
      grower_local_documents: [],
      grower_intl_documents: [],
    };

    const finalDocuments = {
      ...existingDocuments,
      grower_local_documents: [
        ...(existingDocuments.grower_local_documents || []),
      ],
    };

    if (Object.keys(updatedDocuments).length > 0) {
      const updateDocument = (
        arr: DocumentItem[],
        fileName: string,
        newDoc: DocumentItem,
      ) => {
        const index = arr.findIndex((doc) => doc.file_name === fileName);
        if (index !== -1) arr[index] = newDoc;
        else arr.push(newDoc);
      };

      Object.entries(updatedDocuments).forEach(([key, docData]) => {
        let fileName = "";
        if (key === "primaryId") fileName = "identity";
        else if (key === "secondaryId") fileName = "secondary_identity";
        else if (key === "proofOfAddress") fileName = "proof_of_address";
        if (!fileName) return;

        const newDoc: DocumentItem = {
          file_url: docData.downloadUrl,
          file_type: 0,
          file_name: fileName,
          uploaded_date: nowIso,
        };
        updateDocument(
          finalDocuments.grower_local_documents as any,
          fileName,
          newDoc,
        );
      });
    }

    return finalDocuments;
  };

  const buildFinalDetails = () => {
    const currentDetails = kycDetails || {};
    const currentGrowerLocal = currentDetails.grower_local || {};

    return {
      grower_local: {
        postal_code:
          updatedKycData.ghanaPostCode !== undefined
            ? updatedKycData.ghanaPostCode || "0000"
            : currentGrowerLocal.postal_code || "0000",
        passport_expire_date:
          updatedKycData.expirationDate ||
          currentGrowerLocal.passport_expire_date ||
          "",
        proof_of_address_type:
          updatedKycData.proofOfAddressType ||
          currentGrowerLocal.proof_of_address_type ||
          "utility_bill",
      },
      ...(currentDetails.grower_intl && {
        grower_intl: currentDetails.grower_intl,
      }),
    };
  };

  const onSubmit = async () => {
    if (!authId) {
      showErrorToast("User not authenticated");
      return;
    }
    if (!hasAnyChanges) {
      showSuccessToast("No changes to update!");
      return;
    }

    if (isDraft) {
      if (Object.keys(updatedDocuments).length > 0) {
        const nowIso = new Date().toISOString();
        const existingDocuments = residentKYC?.documents || {
          corp_identity: [],
          finance: [],
          auth_rep: [],
          grower_local_documents: [],
          grower_intl_documents: [],
        };
        const updatedDocumentsPayload = {
          ...existingDocuments,
          grower_local_documents: [
            ...(existingDocuments.grower_local_documents || []),
          ],
        };

        const updateDocument = (
          arr: DocumentItem[],
          fileName: string,
          newDoc: DocumentItem,
        ) => {
          const index = arr.findIndex((doc) => doc.file_name === fileName);
          if (index !== -1) arr[index] = newDoc;
          else arr.push(newDoc);
        };

        Object.entries(updatedDocuments).forEach(([key, docData]) => {
          let fileName = "";
          if (key === "primaryId") fileName = "identity";
          else if (key === "secondaryId") fileName = "secondary_identity";
          else if (key === "proofOfAddress") fileName = "proof_of_address";
          if (!fileName) return;

          const newDoc: DocumentItem = {
            file_url: docData.downloadUrl,
            file_type: 0,
            file_name: fileName,
            uploaded_date: nowIso,
          };
          updateDocument(
            updatedDocumentsPayload.grower_local_documents as any,
            fileName,
            newDoc,
          );
        });

        await updateDocumentsMutation.mutateAsync({
          body: { userId: authId, documents: updatedDocumentsPayload } as any,
        });
      }
      if (Object.keys(updatedKycData).length > 0) {
        await updateDetailsMutation.mutateAsync({
          body: {
            userId: authId,
            details: {
              grower_local: {
                ...(updatedKycData.ghanaPostCode && {
                  postal_code: updatedKycData.ghanaPostCode,
                }),
                ...(updatedKycData.expirationDate && {
                  passport_expire_date: updatedKycData.expirationDate,
                }),
                proof_of_address_type:
                  kycDetails?.grower_local?.proof_of_address_type,
                details_status: kycDetails?.grower_local?.details_status,
                status_error_message:
                  kycDetails?.grower_local?.status_error_message,
              },
            },
          } as any,
        });
      }
    } else {
      const finalDocuments = buildFinalDocuments();
      const finalDetails = buildFinalDetails();

      await submitMutation.mutateAsync({
        body: {
          userId: authId,
          kycStatus: "Draft",
          submittedDate: new Date().toISOString(),
          kycType: "GrowerLocal",
          details: finalDetails as any,
          documents: finalDocuments as any,
        },
      });
    }

    setUpdatedDocuments({});
    reset({
      expirationDate: kycDetails?.grower_local?.passport_expire_date || "",
      ghanaPostCode: kycDetails?.grower_local?.postal_code || "0000",
    });

    router.push("/profile");
  };
  if (isLoading || error) {
    return <ResidentEditKycSkeleton />;
  }

  return (
    <FormProvider {...methods}>
      <div className="flex flex-col items-center justify-center px-1 py-2 md:px-4">
        <div className="w-full max-w-lg space-y-8 md:max-w-4xl lg:max-w-2xl">
          <div className="space-y-3 text-left md:text-center">
            <p className="text-sm text-muted-foreground">{t("editSubTitle")}</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <p className="text-sm font-semibold">{t("uploadId")}</p>
            <FileCard
              filename={getFileNameFromUrl(
                updatedDocuments.primaryId?.downloadUrl ||
                  categorizedDocs.primaryId?.file_url ||
                  "",
              )}
              fileSize="1.2 MB/2 MB"
              fileType="identity"
              onRemove={() => onRemove("id")}
            />

            <p className="text-sm font-semibold">{t("uploadPassport")}</p>
            <FileCard
              filename={getFileNameFromUrl(
                updatedDocuments.secondaryId?.downloadUrl ||
                  categorizedDocs.secondaryId?.file_url ||
                  "",
              )}
              fileSize="1.2 MB/2 MB"
              fileType="passport"
              onRemove={() => onRemove("passport")}
            />

            {(categorizedDocs.primaryId ||
              categorizedDocs.secondaryId ||
              updatedDocuments.primaryId ||
              updatedDocuments.secondaryId) && (
              <>
                <p className="text-sm font-semibold">{t("expiryDate")}</p>
                <FormDateInput
                  name="expirationDate"
                  control={control}
                  className="w-3/4 border-input-border xl:w-1/2"
                />
              </>
            )}

            <p className="text-sm font-semibold">Proof of Address</p>
            {kycDetails?.grower_local?.proof_of_address_type ===
            "ghana_post_code" ? (
              <FormInput
                name="ghanaPostCode"
                type="text"
                placeholder="E.g. GA 000-0000"
                className="w-3/4  border-input-border xl:w-1/2"
                pattern="[a-zA-Z0-9-]*"
                onInput={handlePostCodeInput}
              />
            ) : (
              <>
                <FileCard
                  filename={getFileNameFromUrl(
                    updatedDocuments.proofOfAddress?.downloadUrl ||
                      categorizedDocs.proofOfAddress?.file_url ||
                      "",
                  )}
                  fileSize="1.2 MB/2 MB"
                  fileType="proof_of_address"
                  onRemove={() =>
                    onRemove(
                      "proofOfAddress",
                      getProofOfAddressType(
                        categorizedDocs.proofOfAddress?.file_name || "",
                      ),
                    )
                  }
                />

                {!hasAnyDocuments && (
                  <div className="p-8 text-center">
                    <p className="text-muted-foreground">
                      No documents found. Please upload your documents.
                    </p>
                  </div>
                )}
              </>
            )}

            <div className="flex flex-col items-center justify-center gap-4">
              <Button
                type="submit"
                className="w-3/4"
                onClick={() => {
                  setIsDraft(false);
                }}
                disabled={
                  submitMutation.isPending ||
                  updateDocumentsMutation.isPending ||
                  updateDetailsMutation.isPending ||
                  !hasAnyChanges
                }
              >
                {submitMutation.isPending ? "Submitting..." : tOther("save")}
              </Button>

              <Button
                type="submit"
                variant="secondary"
                className="w-3/4 rounded-xl bg-gray-light text-[#1A5514] hover:bg-gray-light/90"
                onClick={() => {
                  setIsDraft(true);
                }}
                disabled={
                  updateDocumentsMutation.isPending ||
                  updateDetailsMutation.isPending ||
                  submitMutation.isPending ||
                  !hasAnyChanges
                }
              >
                {updateDocumentsMutation.isPending ||
                updateDetailsMutation.isPending
                  ? "Updating..."
                  : tOther("saveUpdate")}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </FormProvider>
  );
}
