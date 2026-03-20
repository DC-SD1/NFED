/* eslint-disable max-lines-per-function */
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

export function AuthorizedRepresentativeForm() {
  const t = useTranslations() as any;
  const {
    authorizedRepresentative,
    setAuthorizedRepresentative,
    setAttemptedAuthorizedRepresentative,
    setSkippedAuthorizedRepresentative,
    setCanSkipAuthorizedRepresentative,
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
    uploadResponse: _uploadResponse,
    setFile,
    setUploadResponse,
    updateFileProgress,
    updateFileStatus,
  } = useBuyerDocumentUploadStore();

  // Get KYC document status for resubmission - only call when we have a valid kycId
  const { authorizedRepresentative: docStatus, isPending: isKycLoading } =
    useKycDocumentStatus(isResubmissionFlow ? kycId : null);

  // Track resubmissions
  const {
    markFieldUploaded,
    clearFieldUploaded,
    markFieldUploading,
    clearFieldUploading,
  } = useKycResubmissionTracker();

  const formSchema = z.object({
    idOfApplicant: z
      .string()
      .min(1, { message: "ID of applicant is required" })
      .refine((val) => val.trim() !== "", {
        message: "ID of applicant is required",
      }),
    idOfShareholders: z
      .array(z.string())
      .min(1, { message: "At least one shareholder ID is required" })
      .refine((arr) => arr.every((val) => val.trim() !== ""), {
        message: "All shareholder IDs must be valid",
      }),
    certificateOfIncorporation: z.string().optional(),
  });

  type FormSchema = z.infer<typeof formSchema>;

  const form = useForm<FormSchema>({
    resolver: isResubmissionFlow ? undefined : zodResolver(formSchema),
    defaultValues: authorizedRepresentative,
    mode: "onTouched", // Only show errors after field is touched/blurred
  });

  const isUploading = uploadedFile?.status === "uploading";

  // Compute button states based on actual field values from store and/or accepted statuses
  const isRequiredFilesUploaded =
    !!authorizedRepresentative.idOfApplicant &&
    authorizedRepresentative.idOfApplicant.trim() !== "" &&
    authorizedRepresentative.idOfShareholders.length > 0;

  const isRequiredSatisfied = isResubmissionFlow
    ? (docStatus.idOfApplicant.isAccepted ||
        (!!authorizedRepresentative.idOfApplicant &&
          authorizedRepresentative.idOfApplicant.trim() !== "")) &&
      (docStatus.idOfShareholders.isAccepted ||
        authorizedRepresentative.idOfShareholders.length > 0)
    : isRequiredFilesUploaded;

  const hasAnyFiles =
    (!!authorizedRepresentative.idOfApplicant &&
      authorizedRepresentative.idOfApplicant.trim() !== "") ||
    authorizedRepresentative.idOfShareholders.length > 0 ||
    (!!authorizedRepresentative.certificateOfIncorporation &&
      authorizedRepresentative.certificateOfIncorporation.trim() !== "");

  const canSubmit = isRequiredSatisfied && !isUploading && !isKycLoading;
  const canSkip = !hasAnyFiles && !isUploading;

  // Update skip state in store whenever hasAnyFiles changes
  useEffect(() => {
    if (hasAnyFiles) {
      setSkippedAuthorizedRepresentative(false);
    }
    // Update canSkip state so layout knows whether to enable skip button
    setCanSkipAuthorizedRepresentative(canSkip);
  }, [
    hasAnyFiles,
    canSkip,
    setSkippedAuthorizedRepresentative,
    setCanSkipAuthorizedRepresentative,
  ]);

  // Prevent feedback loop: skip store update while hydrating/resetting
  const isHydratingRef = useRef(false);

  // Rehydrate from persisted store after refresh/navigation without causing loops
  useEffect(() => {
    const currentValues = form.getValues();
    const valuesChanged =
      JSON.stringify(currentValues) !==
      JSON.stringify(authorizedRepresentative);
    if (!form.formState.isDirty && valuesChanged) {
      isHydratingRef.current = true;
      form.reset(authorizedRepresentative);
      setTimeout(() => {
        isHydratingRef.current = false;
      }, 0);
    }
  }, [authorizedRepresentative, form]);

  useEffect(() => {
    const subscription = form.watch((value) => {
      if (isHydratingRef.current) return;
      setAuthorizedRepresentative(value as FormSchema);

      // Clear uploaded state when field is cleared
      const fields: (keyof FormSchema)[] = [
        "idOfApplicant",
        "idOfShareholders",
        "certificateOfIncorporation",
      ];
      fields.forEach((fieldName) => {
        const fieldValue = value[fieldName];
        if (
          !fieldValue ||
          (typeof fieldValue === "string" && fieldValue.trim() === "")
        ) {
          clearFieldUploaded(fieldName);
        }
      });
    });
    return () => subscription.unsubscribe();
  }, [form, setAuthorizedRepresentative, clearFieldUploaded]);

  const onSubmit: SubmitHandler<FormSchema> = async (data: FormSchema) => {
    setAuthorizedRepresentative(data);
    setAttemptedAuthorizedRepresentative(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // If we're in a resubmission flow, redirect back to review page
    if (isResubmissionFlow) {
      router.push(`/${locale}/onboarding/review/${kycId}`);
    } else {
      // Normal onboarding flow - continue to next step
      router.push(`/${locale}/onboarding/company-documents/financial-standing`);
    }
  };

  // Upload handlers factory
  const createUploadHandlers = (fieldName: keyof FormSchema) => ({
    onUploadStart: (uploadedFile: File) => {
      // Clear skipped state since user started uploading
      setSkippedAuthorizedRepresentative(false);
      // Mark as attempted once any upload starts
      setAttemptedAuthorizedRepresentative(true);
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
        idOfApplicant: "id_of_applicant",
        idOfShareholders: "id_of_shareholders",
        certificateOfIncorporation: "certificate_of_incorporation",
      };

      const documentId = documentIdMap[fieldName];
      if (documentId) {
        markFieldUploaded(fieldName, documentId);
      }

      clearFieldUploading(fieldName);

      // Skip validation triggering when in resubmission flow
      if (!isResubmissionFlow) {
        // FormUpload component already sets the form value with shouldValidate: true
        // Wait for validation to complete
        await form.trigger(fieldName);
        await form.trigger(); // Trigger validation for all fields
      }
    },
    onUploadError: (_fileId: string, error: string) => {
      updateFileStatus("error", error);
      clearFieldUploading(fieldName);
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormUpload
          name="idOfApplicant"
          accept={{
            "application/pdf": [".pdf"],
            "image/jpeg": [".jpeg"],
            "image/png": [".png"],
          }}
          maxFiles={1}
          maxSize={10 * 1024 * 1024}
          disabled={isKycLoading || docStatus.idOfApplicant.disabled}
          isCompleted={docStatus.idOfApplicant.disabled}
          className="w-full"
          label={t("buyerOnboarding.authorizedRepresentative.idOfApplicant")}
          uploadFunction={uploadFunction}
          messages={{
            fileTooLarge: t("common.errors.field_too_large"),
            tooManyFiles: t("common.errors.invalid_value"),
            fileInvalidType: t("common.errors.invalid_format"),
          }}
          {...createUploadHandlers("idOfApplicant")}
          dropzoneProps={{
            description: docStatus.idOfApplicant.isAccepted
              ? "Uploaded"
              : t("buyerOnboarding.authorizedRepresentative.labelDescription"),
            className: docStatus.idOfApplicant.isAccepted
              ? "border-gray-300 border-dashed bg-gray-50"
              : "border-[#6F7978]",
            title: docStatus.idOfApplicant.isAccepted
              ? docStatus.idOfApplicant.filename
              : undefined,
          }}
        />

        <FormUpload
          name="idOfShareholders"
          accept={{
            "application/pdf": [".pdf"],
            "image/jpeg": [".jpeg"],
            "image/png": [".png"],
          }}
          maxFiles={3}
          maxSize={10 * 1024 * 1024}
          disabled={isKycLoading || docStatus.idOfShareholders.disabled}
          isCompleted={docStatus.idOfShareholders.disabled}
          className="w-full"
          label={t("buyerOnboarding.authorizedRepresentative.idOfShareholders")}
          uploadFunction={uploadFunction}
          messages={{
            fileTooLarge: t("common.errors.field_too_large"),
            tooManyFiles: t("common.errors.invalid_value"),
            fileInvalidType: t("common.errors.invalid_format"),
          }}
          {...createUploadHandlers("idOfShareholders")}
          dropzoneProps={{
            description: docStatus.idOfShareholders.isAccepted
              ? "Uploaded"
              : t("buyerOnboarding.authorizedRepresentative.labelDescription"),
            className: docStatus.idOfShareholders.isAccepted
              ? "border-gray-300 border-dashed bg-gray-50"
              : "border-[#6F7978]",
            title: docStatus.idOfShareholders.isAccepted
              ? docStatus.idOfShareholders.filename
              : undefined,
          }}
        />

        <FormUpload
          name="certificateOfIncorporation"
          accept={{
            "application/pdf": [".pdf"],
            "image/jpeg": [".jpeg"],
            "image/png": [".png"],
          }}
          maxFiles={1}
          maxSize={10 * 1024 * 1024}
          disabled={
            isKycLoading || docStatus.certificateOfIncorporation.disabled
          }
          isCompleted={docStatus.certificateOfIncorporation.disabled}
          className="w-full"
          label={t(
            "buyerOnboarding.authorizedRepresentative.certificateOfIncorporation",
          )}
          uploadFunction={uploadFunction}
          messages={{
            fileTooLarge: t("common.errors.field_too_large"),
            tooManyFiles: t("common.errors.invalid_value"),
            fileInvalidType: t("common.errors.invalid_format"),
          }}
          {...createUploadHandlers("certificateOfIncorporation")}
          dropzoneProps={{
            description: docStatus.certificateOfIncorporation.isAccepted
              ? "Uploaded"
              : t("buyerOnboarding.authorizedRepresentative.labelDescription"),
            className: docStatus.certificateOfIncorporation.isAccepted
              ? "border-gray-300 border-dashed bg-gray-50"
              : "border-[#6F7978]",
            title: docStatus.certificateOfIncorporation.isAccepted
              ? docStatus.certificateOfIncorporation.filename
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
                  : "/onboarding/company-documents/corporate-identity"
              }
            >
              {t("buyerOnboarding.authorizedRepresentative.back")}
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
              t("buyerOnboarding.authorizedRepresentative.saveAndContinue")
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
