"use client";

import { Button } from "@cf/ui";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

import { useApiClient } from "@/lib/api";
import { useKycData } from "@/lib/hooks/use-kyc-data";
import type { KycDocumentSection } from "@/lib/kyc/document-config";
import { useOnboardingStore } from "@/lib/stores/onboarding-store";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toast";

import DocumentError from "./document-error";
import type { DocumentData } from "./document-list";
import DocumentLoader from "./document-loader";
import { ReviewSection } from "./review-section";

// Helper utilities
const SECTION_KEYS: readonly KycDocumentSection[] = [
  "corporateIdentity",
  "authorizedRepresentative",
  "financial",
] as const;

interface ResubmissionFilePayload {
  file_url?: string;
  file_type?: "PDF" | "JPEG" | "PNG" | null;
  file_name?: string;
  uploaded_date?: string;
}

const normalizeUploadEntries = (value: string | string[] | undefined): string[] => {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.filter(
      (entry): entry is string => typeof entry === "string" && entry.trim().length > 0,
    );
  }

  return value.trim().length > 0 ? [value] : [];
};

const getFileNameFromUrl = (url: string | null | undefined): string => {
  if (!url || url.trim() === "") return "Unknown file";

  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname || "";
    const filename = pathname.split("/").filter(Boolean).pop();
    return filename || url;
  } catch {
    const parts = url.split("/");
    const filename = parts.pop();
    return filename || url;
  }
};

const getFileTypeFromFilename = (
  filename: string | null | undefined,
): "PDF" | "JPEG" | "PNG" | null => {
  if (!filename) return null;
  const extension = filename.split(".").pop()?.toUpperCase();

  if (extension === "PDF") return "PDF";
  if (extension === "JPG" || extension === "JPEG") return "JPEG";
  if (extension === "PNG") return "PNG";

  return null;
};

const hasResubmissionUpload = (doc: DocumentData) =>
  doc.hasUpdatedUpload === true && normalizeUploadEntries(doc.uploadValue).length > 0;

type SectionDocuments = Record<KycDocumentSection, DocumentData[]>;

const buildResubmissionEntries = (
  docs: DocumentData[],
  timestamp: string,
): ResubmissionFilePayload[] =>
  docs
    .filter((doc) => doc.status === "rejected" && hasResubmissionUpload(doc))
    .flatMap((doc) =>
      normalizeUploadEntries(doc.uploadValue).map((url) => ({
        file_url: url,
        file_type: getFileTypeFromFilename(url),
        file_name: getFileNameFromUrl(url),
        uploaded_date: timestamp,
      })),
    );

const computeSectionStatuses = (
  documents: SectionDocuments,
  getSectionStatus: (section: KycDocumentSection) => "approved" | "pending" | "rejected",
): Record<KycDocumentSection, "approved" | "pending" | "rejected" | "updated"> =>
  SECTION_KEYS.reduce<Record<KycDocumentSection, "approved" | "pending" | "rejected" | "updated">>((acc, section) => {
    const baseStatus = getSectionStatus(section);
    acc[section] =
      (baseStatus === "pending" || baseStatus === "rejected") && documents[section].some(hasResubmissionUpload)
        ? "updated"
        : baseStatus;
    return acc;
  }, {} as Record<KycDocumentSection, "approved" | "pending" | "rejected" | "updated">);

const collectResubmissionCandidates = (documents: SectionDocuments) =>
  SECTION_KEYS.flatMap((section) => documents[section].filter((doc) => doc.status === "rejected" && hasResubmissionUpload(doc)));

const buildResubmissionDocumentsPayload = (documents: SectionDocuments, timestamp: string) => ({
  corp_identity: buildResubmissionEntries(documents.corporateIdentity, timestamp),
  auth_rep: buildResubmissionEntries(documents.authorizedRepresentative, timestamp),
  finance: buildResubmissionEntries(documents.financial, timestamp),
  grower_local_documents: [],
  grower_intl_documents: [],
});

export function ReviewAdminList() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations();
  const params = useParams<{ id: string }>();
  const { id: kycId } = params;

  const {
    documents,
    isPending,
    error,
    getSectionStatus,
  } = useKycData(locale, kycId);

  // Get onboarding store methods for clearing data after successful resubmission
  const { clearProgressAfterSubmit, setHasSubmitted } = useOnboardingStore();

  const queryClient = useQueryClient();
  const api = useApiClient();

  const sectionDocuments: SectionDocuments = {
    corporateIdentity: documents.corporateIdentity,
    authorizedRepresentative: documents.authorizedRepresentative,
    financial: documents.financial,
  };

  const sectionStatuses = computeSectionStatuses(sectionDocuments, getSectionStatus);
  const resubmissionCandidates = collectResubmissionCandidates(sectionDocuments);
  const canSubmitResubmission = resubmissionCandidates.length > 0;

  const { mutateAsync: mutateAsyncResubmit, isPending: isPendingResubmitResubmit } =
    api.useMutation("patch", "/kyc/resubmit/{kycId}", {
      path: {
        kycId: kycId,
      },
      onSuccess: async () => {
        // Mark as submitted and clear onboarding store data
        setHasSubmitted(true);
        clearProgressAfterSubmit();

        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: ["get", "/kyc/get-status"],
          }),
          queryClient.invalidateQueries({
            queryKey: ["get", "/kyc/get-status"],
          }),
        ]);
        showSuccessToast(
          `KYC resubmission successful, we'll notify you on the status of your account.`,
        );
        router.push(`/${locale}/home`);
      },
      onError: (error: any) => {
        showErrorToast(error?.message ?? "");
      },
    });

  // Helper function to create document objects for resubmission
  const createResubmissionDocuments = () => {
    const timestamp = new Date().toISOString();

    return buildResubmissionDocumentsPayload(sectionDocuments, timestamp);
  };

  const onSubmitResubmission = async () => {
    const resubmissionDocuments = createResubmissionDocuments();

    const totalDocs = resubmissionDocuments.corp_identity.length +
      resubmissionDocuments.auth_rep.length +
      resubmissionDocuments.finance.length;

    if (totalDocs === 0) {
      showErrorToast("No documents to resubmit");
      return;
    }

    await mutateAsyncResubmit({
      params: {
        path: {
          kycId: kycId,
        },
      },
      body: {
        kycStatus: "Submitted",
        kycType: "buyer",
        submittedDate: new Date().toISOString(),
        documents: resubmissionDocuments,
      } as any,
    });
  };

  // Show loading state
  if (isPending) {
    return (
      <DocumentLoader />
    );
  }

  // Show error state
  if (error) {
    return (
      <DocumentError />
    );
  }

  return (
    <div className="relative  md:pb-20 lg:pb-0">
      <div className="divide-y divide-[#E5E7EB]">
        <ReviewSection
          title="Organization information"
          status="approved"
          statusText="Approved"
        />
        <ReviewSection
          title="Crop interest"
          status="approved"
          statusText="Approved"
        />
        <ReviewSection
          title="Corporate identity"
          status={sectionStatuses.corporateIdentity}
          documents={sectionDocuments.corporateIdentity}
        />
        <ReviewSection
          title="Authorized representative"
          status={sectionStatuses.authorizedRepresentative}
          documents={sectionDocuments.authorizedRepresentative}
        />
        <ReviewSection
          title="Financial standing & liquidity"
          status={sectionStatuses.financial}
          documents={sectionDocuments.financial}
        />
      </div>

      <div className="inset-x-0 bottom-0 z-50 mt-10 flex flex-col-reverse justify-end gap-4 bg-white p-4 md:fixed md:flex-row lg:static lg:bg-transparent lg:p-0 lg:shadow-none">
        <Button
          type="button"
          variant="ghost"
          className="text-primary h-12 w-full rounded-xl bg-transparent px-12 font-bold hover:bg-[#F5F5F5] hover:text-[hsl(var(--text-dark))] lg:w-48 lg:bg-[#F5F5F5] lg:text-[hsl(var(--text-dark))]"
          onClick={() => router.back()}
        >
          {t("common.back")}
        </Button>
        <Button
          type="button"
          className="h-12 w-full rounded-xl px-10 font-bold lg:w-48"
          disabled={!canSubmitResubmission || isPendingResubmitResubmit}
          onClick={onSubmitResubmission}
        >
          {isPendingResubmitResubmit ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            t("common.resubmit")
          )}
        </Button>
      </div>
    </div>
  );
}
