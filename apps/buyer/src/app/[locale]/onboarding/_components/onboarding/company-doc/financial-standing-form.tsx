"use client";

import { Button, Form } from "@cf/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { type Locale, useTranslations } from "next-intl";
import { parseAsString, useQueryState } from "nuqs";
import { useEffect, useRef } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormUpload } from "@/components/form-upload";
import { useBuyerDocumentUpload } from "@/lib/hooks/use-buyer-document-upload";
import { useKycDocumentStatus } from "@/lib/hooks/use-kyc-document-status";
import { useKycResubmissionTracker } from "@/lib/hooks/use-kyc-resubmission-tracker";
import { useOnboardingStore } from "@/lib/stores/onboarding-store";
import { useBuyerDocumentUploadStore } from "@/lib/stores/upload-store";

// Helper to create upload handlers
// eslint-disable-next-line max-params
function createUploadHandlers(
  fieldName: string,
  setFile: (file: any) => void,
  updateFileProgress: (progress: number) => void,
  updateFileStatus: (
    status: "uploading" | "success" | "error" | "idle",
    errorMessage?: string,
  ) => void,
  setUploadResponse: (response: any) => void,
  setSkippedFinancialStanding: (skipped: boolean) => void,
  setAttemptedFinancialStanding: (attempted: boolean) => void,
  form: any,
  markFieldUploaded: (fieldName: string, documentId: string) => void,
  markFieldUploading: (fieldName: string) => void,
  clearFieldUploading: (fieldName: string) => void,
) {
  return {
    onUploadStart: (uploadedFile: File) => {
      setSkippedFinancialStanding(false);
      setAttemptedFinancialStanding(true);
      setFile({
        name: uploadedFile.name,
        size: uploadedFile.size,
        type: uploadedFile.type,
        progress: 0,
        status: "uploading",
      });
      markFieldUploading(fieldName);
    },
    onUploadProgress: (_fileId: string, progress: number) => {
      updateFileProgress(progress);
    },
    onUploadSuccess: async (_fileId: string, data: any) => {
      updateFileStatus("success");
      setUploadResponse(data);

      // Mark field as uploaded when file is uploaded
      // Map field names to document IDs for tracking
      const documentIdMap: Record<string, string> = {
        auditedFinancialStatements: "audited_financial_statements",
        bankReferenceLetter: "bank_reference_letter",
        creditRatingReport: "credit_rating_report",
        proofOfFunds: "proof_of_funds",
        shippingRecords: "shipping_records",
      };

      const documentId = documentIdMap[fieldName];
      if (documentId) {
        markFieldUploaded(fieldName, documentId);
      }

      clearFieldUploading(fieldName);

      await form.trigger(fieldName);
      await form.trigger();
    },
    onUploadError: (_fileId: string, error: string) => {
      updateFileStatus("error", error);
      clearFieldUploading(fieldName);
    },
  };
}

// eslint-disable-next-line max-lines-per-function
export function FinancialStandingForm() {
  const t = useTranslations() as any;
  const {
    financialStanding,
    setFinancialStanding,
    setAttemptedFinancialStanding,
    setSkippedFinancialStanding,
    setCanSkipFinancialStanding,
  } = useOnboardingStore();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as Locale;

  // Use nuqs for type-safe kycId management
  const [kycId] = useQueryState("kycId", parseAsString.withDefault(""));

  // Check if we're in a resubmission flow (has kycId query parameter)
  const isResubmissionFlow = !!kycId && kycId.trim() !== "";

  // Upload functionality
  const { uploadFunction } = useBuyerDocumentUpload();
  const {
    file: uploadedFile,
    setFile,
    setUploadResponse,
    updateFileProgress,
    updateFileStatus,
  } = useBuyerDocumentUploadStore();

  // Get KYC document status for resubmission - only call when we have a valid kycId
  const { financial: docStatus, isPending: isKycLoading } =
    useKycDocumentStatus(isResubmissionFlow ? kycId : null);

  // Track resubmissions
  const {
    markFieldUploaded,
    clearFieldUploaded,
    markFieldUploading,
    clearFieldUploading,
  } = useKycResubmissionTracker();

  const formSchema = z.object({
    auditedFinancialStatements: z.string().optional(),
    bankReferenceLetter: z.string().optional(),
    creditRatingReport: z.string().optional(),
    proofOfFunds: z.string().optional(),
    shippingRecords: z.string().optional(),
  });

  type FormSchema = z.infer<typeof formSchema>;

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: financialStanding,
    mode: "onTouched", // Only show errors after field is touched/blurred
  });

  const isUploading = uploadedFile?.status === "uploading";

  // Compute button states based on actual field values from store
  const hasAnyFiles =
    (!!financialStanding.auditedFinancialStatements &&
      financialStanding.auditedFinancialStatements.trim() !== "") ||
    (!!financialStanding.bankReferenceLetter &&
      financialStanding.bankReferenceLetter.trim() !== "") ||
    (!!financialStanding.creditRatingReport &&
      financialStanding.creditRatingReport.trim() !== "") ||
    (!!financialStanding.proofOfFunds &&
      financialStanding.proofOfFunds.trim() !== "") ||
    (!!financialStanding.shippingRecords &&
      financialStanding.shippingRecords.trim() !== "");

  // Allow save and continue when at least one file is uploaded (for partial progress)
  const canSubmit = hasAnyFiles && !isUploading;
  const canSkip = !hasAnyFiles && !isUploading;

  // Update skip state in store whenever hasAnyFiles changes
  useEffect(() => {
    if (hasAnyFiles) {
      setSkippedFinancialStanding(false);
    }
    // Update canSkip state so layout knows whether to enable skip button
    setCanSkipFinancialStanding(canSkip);
  }, [
    hasAnyFiles,
    canSkip,
    setSkippedFinancialStanding,
    setCanSkipFinancialStanding,
  ]);

  // Prevent feedback loop: skip store update while hydrating/resetting
  const isHydratingRef = useRef(false);

  // Rehydrate from persisted store after refresh/navigation without causing loops
  useEffect(() => {
    const currentValues = form.getValues();
    const valuesChanged =
      JSON.stringify(currentValues) !== JSON.stringify(financialStanding);
    if (!form.formState.isDirty && valuesChanged) {
      isHydratingRef.current = true;
      form.reset(financialStanding);
      setTimeout(() => {
        isHydratingRef.current = false;
      }, 0);
    }
  }, [financialStanding, form]);

  useEffect(() => {
    const subscription = form.watch((value) => {
      if (isHydratingRef.current) return;
      // Convert optional fields to empty strings for store
      const storeValue = {
        auditedFinancialStatements: value.auditedFinancialStatements ?? "",
        bankReferenceLetter: value.bankReferenceLetter ?? "",
        creditRatingReport: value.creditRatingReport ?? "",
        proofOfFunds: value.proofOfFunds ?? "",
        shippingRecords: value.shippingRecords ?? "",
      };
      setFinancialStanding(storeValue);

      // Clear uploaded state when field is cleared
      const fields: (keyof FormSchema)[] = [
        "auditedFinancialStatements",
        "bankReferenceLetter",
        "creditRatingReport",
        "proofOfFunds",
        "shippingRecords",
      ];
      fields.forEach((fieldName) => {
        const fieldValue = value[fieldName];
        if (!fieldValue || fieldValue.trim() === "") {
          clearFieldUploaded(fieldName);
        }
      });
    });
    return () => subscription.unsubscribe();
  }, [form, setFinancialStanding, clearFieldUploaded]);

  const onSubmit: SubmitHandler<FormSchema> = async (data: FormSchema) => {
    // Convert optional fields to empty strings for store
    const storeData = {
      auditedFinancialStatements: data.auditedFinancialStatements ?? "",
      bankReferenceLetter: data.bankReferenceLetter ?? "",
      creditRatingReport: data.creditRatingReport ?? "",
      proofOfFunds: data.proofOfFunds ?? "",
      shippingRecords: data.shippingRecords ?? "",
    };
    setFinancialStanding(storeData);
    setAttemptedFinancialStanding(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // If we're in a resubmission flow, redirect back to review page
    if (isResubmissionFlow) {
      router.push(`/${locale}/onboarding/review/${kycId}`);
    } else {
      // Normal onboarding flow - continue to review page
      router.push(`/${locale}/onboarding/review`);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormUpload
          name="auditedFinancialStatements"
          accept={{
            "application/pdf": [".pdf"],
            "image/jpeg": [".jpeg"],
            "image/png": [".png"],
          }}
          maxFiles={1}
          maxSize={10 * 1024 * 1024}
          disabled={
            isKycLoading || docStatus.auditedFinancialStatements.disabled
          }
          isCompleted={docStatus.auditedFinancialStatements.disabled}
          className="w-full"
          label={t(
            "buyerOnboarding.financialStanding.auditedFinancialStatements",
          )}
          uploadFunction={uploadFunction}
          messages={{
            fileTooLarge: t("common.errors.field_too_large"),
            tooManyFiles: t("common.errors.invalid_value"),
            fileInvalidType: t("common.errors.invalid_format"),
          }}
          {...createUploadHandlers(
            "auditedFinancialStatements",
            setFile,
            updateFileProgress,
            updateFileStatus,
            setUploadResponse,
            setSkippedFinancialStanding,
            setAttemptedFinancialStanding,
            form,
            markFieldUploaded,
            markFieldUploading,
            clearFieldUploading,
          )}
          dropzoneProps={{
            description: docStatus.auditedFinancialStatements.isAccepted
              ? "Uploaded"
              : t("buyerOnboarding.financialStanding.labelDescription"),
            className: docStatus.auditedFinancialStatements.isAccepted
              ? "border-gray-300 border-dashed bg-gray-50"
              : "border-[#6F7978]",
            title: docStatus.auditedFinancialStatements.isAccepted
              ? docStatus.auditedFinancialStatements.filename
              : undefined,
          }}
        />

        <FormUpload
          name="bankReferenceLetter"
          accept={{
            "application/pdf": [".pdf"],
            "image/jpeg": [".jpeg"],
            "image/png": [".png"],
          }}
          maxFiles={1}
          maxSize={10 * 1024 * 1024}
          disabled={isKycLoading || docStatus.bankReferenceLetter.disabled}
          isCompleted={docStatus.bankReferenceLetter.disabled}
          className="w-full"
          label={t("buyerOnboarding.financialStanding.bankReferenceLetter")}
          uploadFunction={uploadFunction}
          messages={{
            fileTooLarge: t("common.errors.field_too_large"),
            tooManyFiles: t("common.errors.invalid_value"),
            fileInvalidType: t("common.errors.invalid_format"),
          }}
          {...createUploadHandlers(
            "bankReferenceLetter",
            setFile,
            updateFileProgress,
            updateFileStatus,
            setUploadResponse,
            setSkippedFinancialStanding,
            setAttemptedFinancialStanding,
            form,
            markFieldUploaded,
            markFieldUploading,
            clearFieldUploading,
          )}
          dropzoneProps={{
            description: docStatus.bankReferenceLetter.isAccepted
              ? "Uploaded"
              : t("buyerOnboarding.financialStanding.labelDescription"),
            className: docStatus.bankReferenceLetter.isAccepted
              ? "border-gray-300 border-dashed bg-gray-50"
              : "border-[#6F7978]",
            title: docStatus.bankReferenceLetter.isAccepted
              ? docStatus.bankReferenceLetter.filename
              : undefined,
          }}
        />

        <FormUpload
          name="creditRatingReport"
          accept={{
            "application/pdf": [".pdf"],
            "image/jpeg": [".jpeg"],
            "image/png": [".png"],
          }}
          maxFiles={1}
          maxSize={10 * 1024 * 1024}
          disabled={isKycLoading || docStatus.creditRatingReport.disabled}
          isCompleted={docStatus.creditRatingReport.disabled}
          className="w-full"
          label={t("buyerOnboarding.financialStanding.creditRatingReport")}
          uploadFunction={uploadFunction}
          messages={{
            fileTooLarge: t("common.errors.field_too_large"),
            tooManyFiles: t("common.errors.invalid_value"),
            fileInvalidType: t("common.errors.invalid_format"),
          }}
          {...createUploadHandlers(
            "creditRatingReport",
            setFile,
            updateFileProgress,
            updateFileStatus,
            setUploadResponse,
            setSkippedFinancialStanding,
            setAttemptedFinancialStanding,
            form,
            markFieldUploaded,
            markFieldUploading,
            clearFieldUploading,
          )}
          dropzoneProps={{
            description: docStatus.creditRatingReport.isAccepted
              ? "Uploaded"
              : t("buyerOnboarding.financialStanding.labelDescription"),
            className: docStatus.creditRatingReport.isAccepted
              ? "border-gray-300 border-dashed bg-gray-50"
              : "border-[#6F7978]",
            title: docStatus.creditRatingReport.isAccepted
              ? docStatus.creditRatingReport.filename
              : undefined,
          }}
        />

        <FormUpload
          name="proofOfFunds"
          accept={{
            "application/pdf": [".pdf"],
            "image/jpeg": [".jpeg"],
            "image/png": [".png"],
          }}
          maxFiles={1}
          maxSize={10 * 1024 * 1024}
          disabled={isKycLoading || docStatus.proofOfFunds.disabled}
          isCompleted={docStatus.proofOfFunds.disabled}
          className="w-full"
          label={t("buyerOnboarding.financialStanding.proofOfFunds")}
          uploadFunction={uploadFunction}
          messages={{
            fileTooLarge: t("common.errors.field_too_large"),
            tooManyFiles: t("common.errors.invalid_value"),
            fileInvalidType: t("common.errors.invalid_format"),
          }}
          {...createUploadHandlers(
            "proofOfFunds",
            setFile,
            updateFileProgress,
            updateFileStatus,
            setUploadResponse,
            setSkippedFinancialStanding,
            setAttemptedFinancialStanding,
            form,
            markFieldUploaded,
            markFieldUploading,
            clearFieldUploading,
          )}
          dropzoneProps={{
            description: docStatus.proofOfFunds.isAccepted
              ? "Uploaded"
              : t("buyerOnboarding.financialStanding.labelDescription"),
            className: docStatus.proofOfFunds.isAccepted
              ? "border-gray-300 border-dashed bg-gray-50"
              : "border-[#6F7978]",
            title: docStatus.proofOfFunds.isAccepted
              ? docStatus.proofOfFunds.filename
              : undefined,
          }}
        />

        <FormUpload
          name="shippingRecords"
          accept={{
            "application/pdf": [".pdf"],
            "image/jpeg": [".jpeg"],
            "image/png": [".png"],
          }}
          maxFiles={1}
          maxSize={10 * 1024 * 1024}
          disabled={isKycLoading || docStatus.shippingRecords.disabled}
          isCompleted={docStatus.shippingRecords.disabled}
          className="w-full"
          label={t("buyerOnboarding.financialStanding.shippingRecords")}
          uploadFunction={uploadFunction}
          messages={{
            fileTooLarge: t("common.errors.field_too_large"),
            tooManyFiles: t("common.errors.invalid_value"),
            fileInvalidType: t("common.errors.invalid_format"),
          }}
          {...createUploadHandlers(
            "shippingRecords",
            setFile,
            updateFileProgress,
            updateFileStatus,
            setUploadResponse,
            setSkippedFinancialStanding,
            setAttemptedFinancialStanding,
            form,
            markFieldUploaded,
            markFieldUploading,
            clearFieldUploading,
          )}
          dropzoneProps={{
            description: docStatus.shippingRecords.isAccepted
              ? "Uploaded"
              : t("buyerOnboarding.financialStanding.labelDescription"),
            className: docStatus.shippingRecords.isAccepted
              ? "border-gray-300 border-dashed bg-gray-50"
              : "border-[#6F7978]",
            title: docStatus.shippingRecords.isAccepted
              ? docStatus.shippingRecords.filename
              : undefined,
          }}
        />

        <div className="inset-x-0 bottom-0 z-50 flex flex-col-reverse justify-end gap-4 bg-white p-4 md:fixed md:flex-row lg:static lg:bg-transparent lg:p-0 lg:shadow-none">
          <Button
            type="button"
            variant="ghost"
            className="w-full bg-transparent px-12 font-bold text-primary hover:bg-[#F5F5F5] hover:text-[#002D2B] lg:w-auto lg:bg-[#F5F5F5] lg:text-[#002D2B]"
            asChild
          >
            <Link
              href={
                isResubmissionFlow
                  ? `/${locale}/onboarding/review/${kycId}`
                  : "/onboarding/company-documents/authorized-representative"
              }
            >
              {t("buyerOnboarding.financialStanding.back")}
            </Link>
          </Button>
          <Button
            type="submit"
            disabled={!canSubmit}
            className="w-full font-bold lg:w-48"
          >
            {form.formState.isSubmitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              t("buyerOnboarding.financialStanding.saveAndContinue")
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
