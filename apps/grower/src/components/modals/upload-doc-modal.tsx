/* eslint-disable max-lines-per-function */
"use client";

import { Button, Dialog, DialogContent, DialogTitle } from "@cf/ui";
import { FormDateInput } from "@cf/ui/components/form-date-time";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import React, { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

import { useKycDocumentUpload } from "@/hooks/use-kyc-document-upload";
import { useGetKyc } from "@/lib/queries/kyc-query";
import type { DocumentUploadResponse } from "@/lib/stores/upload-store";
import { useModal } from "@/lib/stores/use-modal";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toast";

import { ProofOfAddressSection } from "../dashboard/uploads/address-proof";
import { DocumentUploadSection } from "../dashboard/uploads/document-upload";

// Expanded schema for all expiration dates
const uploadDocSchema = z.object({
  idExpirationDate: z.string().optional(),
  passportExpirationDate: z.string().optional(),
  visaExpirationDate: z.string().optional(),
  ghanaPostCode: z.string().optional(),
});

type UploadDocFormData = z.infer<typeof uploadDocSchema>;

// Include passport and visa document fields in the interface
interface FormDataWithFiles {
  primaryId: DocumentUploadResponse | null;
  secondaryId: DocumentUploadResponse | null;
  proofOfAddressDocument: DocumentUploadResponse | null;
  passportDocument: DocumentUploadResponse | null; // Added
  visaDocument: DocumentUploadResponse | null; // Added
  proofOfAddressType:
    | "ghana_post_code"
    | "utility_bill"
    | "bank_statement"
    | null;
  ghanaPostCode: string;
}

interface UpdatedKycData {
  idExpirationDate?: string;
  passportExpirationDate?: string;
  visaExpirationDate?: string;
  ghanaPostCode?: string;
  proofOfAddressType?: string;
}

export default function UploadDocModal() {
  const { isOpen, onClose, type, data } = useModal();
  const t = useTranslations("dashboard.kyc");
  const { uploadFunction } = useKycDocumentUpload();

  const isModalOpen = isOpen && type === "UpdateKycDocuments";
  const { kycData } = useGetKyc({ enabled: isModalOpen });

  const methods = useForm<UploadDocFormData>({
    resolver: zodResolver(uploadDocSchema),
    defaultValues: {
      idExpirationDate:
        data?.currentExpirationDate ||
        kycData?.value?.details?.grower_local?.passport_expire_date ||
        "",
      passportExpirationDate:
        kycData?.value?.details?.grower_intl?.passport_expire_date || "",
      visaExpirationDate:
        kycData?.value?.details?.grower_intl?.visa_expire_date || "",
      ghanaPostCode: data?.currentGhanaPostCode || "0000",
    },
  });

  const { control, handleSubmit, watch, reset } = methods;

  // Initialize new state properties for passport and visa
  const [formDataWithFiles, setFormDataWithFiles] = useState<FormDataWithFiles>(
    {
      primaryId: null,
      secondaryId: null,
      proofOfAddressDocument: null,
      passportDocument: null,
      visaDocument: null,
      proofOfAddressType: data?.proofOfAddressType || null,
      ghanaPostCode: data?.currentGhanaPostCode || "",
    },
  );

  useEffect(() => {
    if (isModalOpen) {
      reset({
        idExpirationDate:
          data?.currentExpirationDate ||
          kycData?.value?.details?.grower_local?.passport_expire_date ||
          "",
        passportExpirationDate:
          kycData?.value?.details?.grower_intl?.passport_expire_date || "",
        visaExpirationDate:
          kycData?.value?.details?.grower_intl?.visa_expire_date || "",
        ghanaPostCode: data?.currentGhanaPostCode || "0000",
      });
      // Reset all document fields on modal open
      setFormDataWithFiles({
        primaryId: null,
        secondaryId: null,
        proofOfAddressDocument: null,
        passportDocument: null,
        visaDocument: null,
        proofOfAddressType: data?.proofOfAddressType || null,
        ghanaPostCode: data?.currentGhanaPostCode || "",
      });
    }
  }, [isModalOpen, data, kycData, reset]);

  // Watch for changes in all relevant form fields
  const updatedKycData: UpdatedKycData = useMemo(() => {
    const idExpirationDate = watch("idExpirationDate");
    const passportExpirationDate = watch("passportExpirationDate");
    const visaExpirationDate = watch("visaExpirationDate");
    const ghanaPostCode = watch("ghanaPostCode");

    const changes: UpdatedKycData = {};
    if (
      idExpirationDate !==
      (data?.currentExpirationDate ||
        kycData?.value?.details?.grower_local?.passport_expire_date ||
        "")
    ) {
      changes.idExpirationDate = idExpirationDate;
    }
    if (
      passportExpirationDate !==
      (kycData?.value?.details?.grower_intl?.passport_expire_date || "")
    ) {
      changes.passportExpirationDate = passportExpirationDate;
    }
    if (
      visaExpirationDate !==
      (kycData?.value?.details?.grower_intl?.visa_expire_date || "")
    ) {
      changes.visaExpirationDate = visaExpirationDate;
    }
    if (ghanaPostCode !== (data?.currentGhanaPostCode || "0000")) {
      changes.ghanaPostCode = ghanaPostCode;
    }
    return changes;
  }, [
    watch,
    data,
    kycData?.value?.details?.grower_local,
    kycData?.value?.details?.grower_intl,
  ]);

  if (!isModalOpen) return null;

  const handleUploadStart =
    (documentKey: keyof FormDataWithFiles) => (uploadedFile: File) => {
      console.log(`Upload started for ${documentKey}:`, uploadedFile.name);
    };

  const handleUploadSuccess =
    (documentKey: keyof FormDataWithFiles) =>
    (_fileId: string, uploadResult: DocumentUploadResponse) => {
      setFormDataWithFiles((prev) => ({
        ...prev,
        [documentKey]: uploadResult,
      }));
    };

  const handleUploadError =
    (documentKey: keyof FormDataWithFiles) => (_fileId: string, error: any) => {
      console.error(`${documentKey} upload failed:`, error);
      showErrorToast(t("uploadError"));
    };

  const handleFileRemoved =
    (documentKey: keyof FormDataWithFiles) => (_fileId: string) => {
      setFormDataWithFiles((prev) => ({
        ...prev,
        [documentKey]: null,
      }));
    };

  const handleProofTypeChange = (
    type: "ghana_post_code" | "utility_bill" | "bank_statement" | null,
  ) => {
    setFormDataWithFiles((prev) => ({
      ...prev,
      proofOfAddressType: type,
    }));
  };

  const onSubmit = async () => {
    const uploadedDocs: Record<string, DocumentUploadResponse> = {};

    // Add logic to handle passport and visa document uploads
    if (
      formDataWithFiles.passportDocument &&
      data.uploadDocType === "passport"
    ) {
      uploadedDocs.passportDocument = formDataWithFiles.passportDocument;
    }
    if (formDataWithFiles.visaDocument && data.uploadDocType === "visa") {
      uploadedDocs.visaDocument = formDataWithFiles.visaDocument;
    }

    if (formDataWithFiles.primaryId && data.uploadDocType === "id") {
      uploadedDocs.primaryId = formDataWithFiles.primaryId;
    }
    if (formDataWithFiles.secondaryId && data.uploadDocType === "id") {
      uploadedDocs.secondaryId = formDataWithFiles.secondaryId;
    }
    if (
      formDataWithFiles.proofOfAddressDocument &&
      data.uploadDocType === "proofOfAddress"
    ) {
      uploadedDocs.proofOfAddress = formDataWithFiles.proofOfAddressDocument;
    }

    if (data.onDocumentUploaded && Object.keys(uploadedDocs).length > 0) {
      Object.entries(uploadedDocs).forEach(([key, docData]) => {
        data.onDocumentUploaded?.(key, docData);
      });
    }
    if (data.onKycDataUpdated && Object.keys(updatedKycData).length > 0) {
      data.onKycDataUpdated?.(updatedKycData);
    }

    const hasDocumentChanges = Object.keys(uploadedDocs).length > 0;
    const hasKycDataChanges = Object.keys(updatedKycData).length > 0;

    if (hasDocumentChanges || hasKycDataChanges) {
      showSuccessToast(
        "Changes saved! Click 'Save Update' on the main form to save all changes.",
      );
    } else {
      showSuccessToast("No changes to save.");
    }

    onClose();
  };

  // Update validation logic for new document types
  const isFormValid = () => {
    if (!data?.uploadDocType) return true;

    switch (data.uploadDocType) {
      case "id":
        console.log(
          "Id doc: ",
          formDataWithFiles.primaryId ||
            formDataWithFiles.secondaryId ||
            !!updatedKycData.idExpirationDate,
        );
        return (
          formDataWithFiles.primaryId ||
          formDataWithFiles.secondaryId ||
          !!updatedKycData.idExpirationDate
        );
      case "passport":
        console.log(
          "Passport: ",
          formDataWithFiles.passportDocument ||
            !!updatedKycData.passportExpirationDate,
        );
        return (
          formDataWithFiles.passportDocument ||
          !!updatedKycData.passportExpirationDate
        );
      case "visa":
        console.log(
          "Visa: ",
          formDataWithFiles.visaDocument || !!updatedKycData.visaExpirationDate,
        );
        return (
          formDataWithFiles.visaDocument || !!updatedKycData.visaExpirationDate
        );
      case "proofOfAddress":
        console.log(
          "Proof: ",
          formDataWithFiles.proofOfAddressDocument ||
            !!updatedKycData.ghanaPostCode,
        );
        return (
          formDataWithFiles.proofOfAddressDocument ||
          !!updatedKycData.ghanaPostCode
        );
      default:
        return Object.keys(updatedKycData).length > 0;
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="mx-auto w-[calc(100%-1rem)] !rounded-3xl p-3 sm:max-w-sm md:max-w-2xl">
        <DialogTitle></DialogTitle>
        <FormProvider {...methods}>
          <div className="flex flex-col items-center justify-center px-8 py-2 md:px-8">
            <div className="w-full max-w-lg space-y-8 md:max-w-4xl lg:max-w-4xl">
              <div className="space-y-3 text-left md:text-center">
                <h2 className="text-center text-2xl font-semibold">
                  {t("residentType.replaceDoc")}
                </h2>
                <p className="text-muted-foreground text-sm">
                  {t("residentType.replaceDocSub")}
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {data.uploadDocType === "id" && (
                  <>
                    <DocumentUploadSection
                      title={t("residentType.uploadId")}
                      formData={formDataWithFiles}
                      uploadFunction={uploadFunction}
                      onUploadStart={handleUploadStart("primaryId")}
                      onUploadSuccess={handleUploadSuccess("primaryId")}
                      onUploadError={handleUploadError("primaryId")}
                      onFileRemoved={handleFileRemoved("primaryId")}
                      documentKey="primaryId"
                    />
                    <DocumentUploadSection
                      title={t("residentType.uploadPassport")}
                      formData={formDataWithFiles}
                      uploadFunction={uploadFunction}
                      onUploadStart={handleUploadStart("secondaryId")}
                      onUploadSuccess={handleUploadSuccess("secondaryId")}
                      onUploadError={handleUploadError("secondaryId")}
                      onFileRemoved={handleFileRemoved("secondaryId")}
                      documentKey="secondaryId"
                    />
                    <div className="space-y-4">
                      <p className="!mb-0 text-sm font-semibold">
                        {t("residentType.expiryDate")}
                      </p>
                      <FormDateInput
                        name="idExpirationDate"
                        control={control}
                        className="border-input-border w-3/4 xl:w-1/2"
                      />
                    </div>
                  </>
                )}

                {/* Combined Passport and Visa section */}
                {data.uploadDocType === "passport" && (
                  <>
                    <DocumentUploadSection
                      title={t("international.uploadPassport")}
                      formData={formDataWithFiles}
                      uploadFunction={uploadFunction}
                      onUploadStart={handleUploadStart("passportDocument")}
                      onUploadSuccess={handleUploadSuccess("passportDocument")}
                      onUploadError={handleUploadError("passportDocument")}
                      onFileRemoved={handleFileRemoved("passportDocument")}
                      documentKey="passportDocument"
                    />
                    <div className="space-y-4">
                      <p className="!mb-0 text-sm font-semibold">
                        {t("residentType.expiryDate")}
                      </p>
                      <FormDateInput
                        name="passportExpirationDate"
                        control={control}
                        className="border-input-border w-3/4 xl:w-1/2"
                      />
                    </div>
                  </>
                )}

                {data.uploadDocType === "visa" && (
                  <>
                    <DocumentUploadSection
                      title={t("international.uploadVisa")}
                      formData={formDataWithFiles}
                      uploadFunction={uploadFunction}
                      onUploadStart={handleUploadStart("visaDocument")}
                      onUploadSuccess={handleUploadSuccess("visaDocument")}
                      onUploadError={handleUploadError("visaDocument")}
                      onFileRemoved={handleFileRemoved("visaDocument")}
                      documentKey="visaDocument"
                    />
                    <div className="space-y-4">
                      <p className=" !mb-0 text-sm font-semibold">
                        {t("international.visaExpiry")}
                      </p>
                      <FormDateInput
                        name="visaExpirationDate"
                        control={control}
                        className="border-input-border w-3/4 xl:w-1/2"
                      />
                    </div>
                  </>
                )}

                {data.uploadDocType === "proofOfAddress" && (
                  <ProofOfAddressSection
                    hideRadioGroup
                    formData={{
                      proofOfAddressType: data.proofOfAddressType ?? null,
                      ghanaPostCode: watch("ghanaPostCode") || "",
                      proofOfAddressDocument:
                        formDataWithFiles.proofOfAddressDocument,
                    }}
                    uploadFunction={uploadFunction}
                    onProofTypeChange={handleProofTypeChange}
                    onUploadStart={handleUploadStart("proofOfAddressDocument")}
                    onUploadSuccess={handleUploadSuccess(
                      "proofOfAddressDocument",
                    )}
                    onUploadError={handleUploadError("proofOfAddressDocument")}
                    onFileRemoved={handleFileRemoved("proofOfAddressDocument")}
                  />
                )}

                <div className="flex w-full flex-col items-center justify-center gap-4">
                  <Button
                    type="submit"
                    variant="default"
                    disabled={!isFormValid()}
                    className="w-3/4"
                  >
                    {t("residentType.upload")}
                  </Button>
                  <Button
                    type="button"
                    variant="unstyled"
                    onClick={onClose}
                    className="w-3/4"
                  >
                    {t("residentType.cancel")}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
