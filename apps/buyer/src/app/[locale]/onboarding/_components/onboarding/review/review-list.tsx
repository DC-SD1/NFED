"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
} from "@cf/ui";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { useApiClient } from "@/lib/api";
import { useAuthUser } from "@/lib/stores/auth/auth-store-ssr";
import { useOnboardingStore } from "@/lib/stores/onboarding-store";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toast";

import { DocumentView } from "../dialog/document-view";
import { ReviewSection } from "./review-section";

// eslint-disable-next-line max-lines-per-function
export function ReviewList() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const api = useApiClient();
  const queryClient = useQueryClient();
  const authUser = useAuthUser();
  const t = useTranslations();
  const [isDocumentViewOpen, setIsDocumentViewOpen] = useState(false);
  const [currentDocumentUrl, setCurrentDocumentUrl] = useState<string>("");

  const handleViewDocument = (documentUrl: string) => {
    setCurrentDocumentUrl(documentUrl);
    setIsDocumentViewOpen(true);
  };

  const handleCloseDocumentView = () => {
    setIsDocumentViewOpen(false);
    setCurrentDocumentUrl("");
  };

  const {
    organisationInformation: orgInfo,
    cropInterest,
    corporateIdentity,
    authorizedRepresentative,
    financialStanding,
    setHasDraft,
    setHasSubmitted,
    clearProgressAfterSubmit,
    isOrganisationInformationComplete,
    isCropInterestComplete,
    isCorporateIdentityComplete,
    isAuthorizedRepresentativeComplete,
    isFinancialStandingComplete,
    isSubmissionAllowed,
    attemptedAuthorizedRepresentative,
    attemptedFinancialStanding,
    skippedAuthorizedRepresentative,
    skippedFinancialStanding,
  } = useOnboardingStore();

  const { mutateAsync, isPending } = api.useMutation("post", "/kyc/draft", {
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["post", "/kyc/draft"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["post", "/kyc/draft"],
        }),
      ]);
      showSuccessToast(`KYC draft created.`);
      // Mark draft saved and keep progress so dashboard shows "Continue".
      setHasDraft(true);
      router.push(`/${locale}/home`);
    },
    onError: (error: any) => {
      showErrorToast(error?.message ?? "");
    },
  });

  const { mutateAsync: mutateAsyncSubmit, isPending: isPendingSubmit } =
    api.useMutation("post", "/kyc/submit", {
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: ["post", "/kyc/submit"],
          }),
          queryClient.invalidateQueries({
            queryKey: ["post", "/kyc/submit"],
          }),
        ]);
        showSuccessToast(
          `Submission successful, we'll notify you on the status of your account.`,
        );
        // Mark submitted so the dashboard banner shows the submitted state
        setHasSubmitted(true);
        // Clear local progress but preserve submitted flag so banner stays in review state
        clearProgressAfterSubmit();
        router.push(`/${locale}/home`);
      },
      onError: (error: any) => {
        showErrorToast(error?.message ?? "");
      },
    });

  const organisationInformation = [
    {
      label: "Organisation Name",
      value: orgInfo.organizationName,
    },
    {
      label: "Size of company by people",
      value: orgInfo.companySize,
    },
    {
      label: "Revenue range",
      value: orgInfo.revenueRange,
    },
  ];

  const crops = cropInterest.crops.map((crop) => ({
    value: crop,
    label: crop, // You might want to map this to a more readable label
  }));

  // Helper function to extract filename from URL
  const getFileNameFromUrl = (url: string | undefined | null): string => {
    if (!url || url.trim() === "") return "Nil";
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname || "";
      const filename = pathname.split("/").filter(Boolean).pop();
      return filename || "Document uploaded";
    } catch {
      const parts = url.split("/");
      const filename = parts.pop();
      return filename || "Document uploaded";
    }
  };

  // Helper function to get file type from URL/filename
  const getFileTypeFromUrl = (
    url: string | null | undefined,
  ): "PDF" | "JPEG" | "PNG" | null => {
    if (!url) return null;
    const filename = getFileNameFromUrl(url);
    const extension = filename.split(".").pop()?.toUpperCase();

    if (extension === "PDF") return "PDF";
    if (extension === "JPG" || extension === "JPEG") return "JPEG";
    if (extension === "PNG") return "PNG";

    return null;
  };

  // Static extension to use when there is no uploaded file URL
  const STATIC_FALLBACK_EXTENSION = "pdf";

  // Humanize logical names like "corporate_identity" -> "Corporate identity"
  const humanizeLogicalName = (logicalName: string): string => {
    const withSpaces = logicalName.replace(/_/g, " ");
    return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
  };

  // Preferred filename: actual uploaded filename when URL exists; otherwise humanized logical with static extension
  const getPreferredFileName = (
    logicalName: string,
    url: string | null | undefined,
  ): string => {
    if (url && url.trim() !== "") return getFileNameFromUrl(url);
    return `${humanizeLogicalName(logicalName)}.${STATIC_FALLBACK_EXTENSION}`;
  };

  const corporateIdentityReviews = [
    {
      label: "Business incorporation docs",
      value: getPreferredFileName(
        "corporate_identity",
        corporateIdentity.businessIncorporationDocs,
      ),
      hasViewButton:
        !!corporateIdentity.businessIncorporationDocs &&
        corporateIdentity.businessIncorporationDocs.trim() !== "",
      documentUrl: corporateIdentity.businessIncorporationDocs,
    },
    {
      label: "Proof of business address",
      value: getPreferredFileName(
        "proof_of_business_address",
        corporateIdentity.proofOfBusinessAddress,
      ),
      hasViewButton:
        !!corporateIdentity.proofOfBusinessAddress &&
        corporateIdentity.proofOfBusinessAddress.trim() !== "",
      documentUrl: corporateIdentity.proofOfBusinessAddress,
    },
    {
      label: "Corporate profile/ brochure",
      value: getPreferredFileName(
        "corporate_profile_or_brochure",
        corporateIdentity.corporateProfileOrBrochure,
      ),
      hasViewButton:
        !!corporateIdentity.corporateProfileOrBrochure &&
        corporateIdentity.corporateProfileOrBrochure.trim() !== "",
      documentUrl: corporateIdentity.corporateProfileOrBrochure,
    },
  ];

  // Separate shareholders data for accordion
  const shareholderFiles = Array.isArray(
    authorizedRepresentative.idOfShareholders,
  )
    ? authorizedRepresentative.idOfShareholders.filter(
        (id) => id && id.trim() !== "",
      )
    : authorizedRepresentative.idOfShareholders &&
        (authorizedRepresentative.idOfShareholders as string).trim() !== ""
      ? [authorizedRepresentative.idOfShareholders as string]
      : [];

  const authorizedRepresentativeReviews = [
    {
      label: "ID of applicant",
      value: getPreferredFileName(
        "authorized_representative",
        authorizedRepresentative.idOfApplicant,
      ),
      hasViewButton:
        !!authorizedRepresentative.idOfApplicant &&
        authorizedRepresentative.idOfApplicant.trim() !== "",
      documentUrl: authorizedRepresentative.idOfApplicant,
    },
    {
      label: "Board Resolution or Power of Attorney",
      value: getPreferredFileName(
        "certificate_of_incorporation",
        authorizedRepresentative.certificateOfIncorporation,
      ),
      hasViewButton:
        !!authorizedRepresentative.certificateOfIncorporation &&
        authorizedRepresentative.certificateOfIncorporation.trim() !== "",
      documentUrl: authorizedRepresentative.certificateOfIncorporation,
    },
  ];

  const financialStandingReviews = [
    {
      label: "Audited financial statements",
      value: getPreferredFileName(
        "audited_financial_statements",
        financialStanding.auditedFinancialStatements,
      ),
      hasViewButton:
        !!financialStanding.auditedFinancialStatements &&
        financialStanding.auditedFinancialStatements.trim() !== "",
      documentUrl: financialStanding.auditedFinancialStatements,
    },
    {
      label: "Bank reference letter",
      value: getPreferredFileName(
        "bank_reference_letter",
        financialStanding.bankReferenceLetter,
      ),
      hasViewButton:
        !!financialStanding.bankReferenceLetter &&
        financialStanding.bankReferenceLetter.trim() !== "",
      documentUrl: financialStanding.bankReferenceLetter,
    },
    {
      label: "Credit rating report",
      value: getPreferredFileName(
        "credit_rating_report",
        financialStanding.creditRatingReport,
      ),
      hasViewButton:
        !!financialStanding.creditRatingReport &&
        financialStanding.creditRatingReport.trim() !== "",
      documentUrl: financialStanding.creditRatingReport,
    },
    {
      label: "Proof of funds",
      value: getPreferredFileName(
        "proof_of_funds",
        financialStanding.proofOfFunds,
      ),
      hasViewButton:
        !!financialStanding.proofOfFunds &&
        financialStanding.proofOfFunds.trim() !== "",
      documentUrl: financialStanding.proofOfFunds,
    },
    {
      label: "Shipping records",
      value: getPreferredFileName(
        "shipping_records",
        financialStanding.shippingRecords,
      ),
      hasViewButton:
        !!financialStanding.shippingRecords &&
        financialStanding.shippingRecords.trim() !== "",
      documentUrl: financialStanding.shippingRecords,
    },
  ];

  // Helper function to create document objects
  const createDocumentObject = (
    fileUrl: string | null,
    fileName: string,
  ): {
    file_url: string | null;
    file_type: 0 | "PDF" | "JPEG" | "PNG" | null;
    file_name: string;
    uploaded_date: string;
  } => {
    const actualFileName = getPreferredFileName(fileName, fileUrl);
    const fileType = getFileTypeFromUrl(fileUrl);

    return {
      file_url: fileUrl,
      file_type: fileType ?? 0,
      file_name: actualFileName,
      uploaded_date: new Date().toISOString(),
    };
  };

  // Document configurations - centralized and easy to maintain
  const documentConfigs = {
    corpIdentity: [
      {
        url: corporateIdentity.businessIncorporationDocs,
        name: "corporate_identity",
      },
      {
        url: corporateIdentity.proofOfBusinessAddress,
        name: "proof_of_business_address",
      },
      {
        url: corporateIdentity.corporateProfileOrBrochure,
        name: "corporate_profile_or_brochure",
      },
    ],
    financial: [
      {
        url: financialStanding.auditedFinancialStatements,
        name: "audited_financial_statements",
      },
      {
        url: financialStanding.bankReferenceLetter,
        name: "bank_reference_letter",
      },
      {
        url: financialStanding.creditRatingReport,
        name: "credit_rating_report",
      },
      { url: financialStanding.proofOfFunds, name: "proof_of_funds" },
      { url: financialStanding.shippingRecords, name: "shipping_records" },
    ],
    authorizedRepresentative: [
      {
        url: authorizedRepresentative.idOfApplicant,
        name: "authorized_representative",
      },
      {
        url: authorizedRepresentative.certificateOfIncorporation,
        name: "certificate_of_incorporation",
      },
    ],
  };

  // Transform configurations into document arrays, filtering out null/empty URLs
  const corpIdentityDocuments = documentConfigs.corpIdentity
    .filter((config) => config.url)
    .map((config) => createDocumentObject(config.url!, config.name));

  const financialDocuments = documentConfigs.financial
    .filter((config) => config.url)
    .map((config) => createDocumentObject(config.url!, config.name));

  const authorizedRepresentativeDocuments = [
    // Applicant (single)
    ...(authorizedRepresentative.idOfApplicant
      ? [
          createDocumentObject(
            authorizedRepresentative.idOfApplicant,
            "authorized_representative",
          ),
        ]
      : []),
    // Shareholders (array or single fallback)
    ...(Array.isArray(authorizedRepresentative.idOfShareholders)
      ? authorizedRepresentative.idOfShareholders
          .filter(Boolean)
          .map((url) => createDocumentObject(url, "id_of_shareholders"))
      : authorizedRepresentative.idOfShareholders
        ? [
            createDocumentObject(
              authorizedRepresentative.idOfShareholders as any,
              "id_of_shareholders",
            ),
          ]
        : []),
    // Certificate (single)
    ...(authorizedRepresentative.certificateOfIncorporation
      ? [
          createDocumentObject(
            authorizedRepresentative.certificateOfIncorporation,
            "certificate_of_incorporation",
          ),
        ]
      : []),
  ];

  // Helper function to transform documents for API
  const transformDocumentsForApi = (
    documents: {
      file_url: string | null;
      file_type: 0 | "PDF" | "JPEG" | "PNG" | null;
      file_name: string;
      uploaded_date: string;
    }[],
  ) =>
    documents
      .filter((doc) => doc.file_url !== null)
      .map(({ file_url, file_type, file_name, uploaded_date }) => ({
        file_url: file_url!,
        file_type,
        file_name,
        uploaded_date,
      })) as {
      file_url?: string;
      file_type?: 0 | 2 | 1 | null;
      file_name?: string;
      uploaded_date?: string;
    }[];

  const onSaveAndExit = async () => {
    await mutateAsync({
      body: {
        userId: authUser?.userId ?? "",
        kycStatus: "draft",
        kycType: "buyer",
        submittedDate: new Date().toISOString(),
        details: {
          grower_local: {
            postal_code: "",
            passport_expire_date: "",
            proof_of_address_type: "",
          },
        },
        documents: {
          corp_identity: transformDocumentsForApi(corpIdentityDocuments),
          finance: transformDocumentsForApi(financialDocuments),
          auth_rep: transformDocumentsForApi(authorizedRepresentativeDocuments),
          grower_local_documents: [],
          grower_intl_documents: [],
        },
      } as any,
    });
  };

  const onSubmit = async () => {
    await mutateAsyncSubmit({
      body: {
        userId: authUser?.userId ?? "",
        kycStatus: "draft",
        kycType: "buyer",
        submittedDate: new Date().toISOString(),
        details: {
          grower_local: {
            postal_code: "",
            passport_expire_date: "",
            proof_of_address_type: "",
          },
          grower_intl: {
            visa_expire_date: "",
            postal_code: "",
            passport_expire_date: "",
            proof_of_address_type: "",
          },
        },
        documents: {
          corp_identity: transformDocumentsForApi(corpIdentityDocuments),
          finance: transformDocumentsForApi(financialDocuments),
          auth_rep: transformDocumentsForApi(authorizedRepresentativeDocuments),
          grower_local_documents: [
            {
              file_url: "",
              file_type: 0,
              file_name: "",
              uploaded_date: "",
            },
          ],
          grower_intl_documents: [
            {
              file_url: "",
              file_type: 0,
              file_name: "",
              uploaded_date: "",
            },
          ],
        },
      } as any,
    });
  };

  return (
    <div>
      <DocumentView
        documentUrl={currentDocumentUrl}
        isOpen={isDocumentViewOpen}
        onClose={handleCloseDocumentView}
      />
      <div className=" divide-y divide-[#E5E7EB]">
        <div className="py-6">
          <ReviewSection
            title="Organisation Information"
            badgeText={
              isOrganisationInformationComplete() ? "Complete" : "Incomplete"
            }
            buttonText="Edit"
            reviews={organisationInformation}
            buttonOnClick={() =>
              router.push(
                `/${locale}/onboarding/basic-information/organisation-information`,
              )
            }
          />
        </div>
        <div className="py-8">
          <ReviewSection
            title="Crop interest"
            badgeText={isCropInterestComplete() ? "Complete" : "Incomplete"}
            details={{
              description: "Crops selected",
              quantity: `(${cropInterest.crops.length})`,
            }}
            buttonText="Edit"
            crops={crops}
            buttonOnClick={() =>
              router.push(
                `/${locale}/onboarding/basic-information/crop-interest`,
              )
            }
          />
        </div>
        <div className="py-8">
          <ReviewSection
            title="Corporate identity"
            badgeText={
              isCorporateIdentityComplete() ? "Complete" : "Incomplete"
            }
            buttonText="Edit"
            reviews={corporateIdentityReviews}
            buttonOnClick={() =>
              router.push(
                `/${locale}/onboarding/company-documents/corporate-identity`,
              )
            }
          />
        </div>
        <div className="py-8">
          <ReviewSection
            title="Authorized representative"
            badgeText={
              skippedAuthorizedRepresentative
                ? "Skipped"
                : attemptedAuthorizedRepresentative
                  ? isAuthorizedRepresentativeComplete()
                    ? "Complete"
                    : "Incomplete"
                  : ""
            }
            buttonText="Edit"
            reviews={authorizedRepresentativeReviews}
            buttonOnClick={() =>
              router.push(
                `/${locale}/onboarding/company-documents/authorized-representative`,
              )
            }
          />

          {/* Shareholders Accordion */}
          <div className="mt-10">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="shareholders" className="border-none">
                <AccordionTrigger className="py-0 hover:no-underline">
                  <div className="space-y-1 text-left">
                    <p className="text-sm font-bold text-[#586665]">
                      ID&apos;s of shareholders
                    </p>
                    <p className="mr-2 text-sm text-[#161D1D]">
                      {shareholderFiles.length > 0
                        ? `${shareholderFiles.length} ${shareholderFiles.length === 1 ? "file" : "files"}`
                        : "Nil"}
                    </p>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  {shareholderFiles.length > 0 ? (
                    <div className="space-y-4 pt-4">
                      {shareholderFiles.map((fileUrl, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm text-[#161D1D]">
                            {getFileNameFromUrl(fileUrl)}
                          </span>
                          <Button
                            className="bg-[#F5F5F5] font-semibold text-[hsl(var(--text-dark))] hover:bg-[#F5F5F5] hover:text-[hsl(var(--text-dark))]"
                            onClick={() => handleViewDocument(fileUrl)}
                          >
                            View
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="pt-4 text-sm text-[#6B7280]">
                      No files uploaded
                    </p>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
        <div className="py-8">
          <ReviewSection
            title="Financial standing & liquidity"
            badgeText={
              skippedFinancialStanding
                ? "Skipped"
                : attemptedFinancialStanding
                  ? isFinancialStandingComplete()
                    ? "Complete"
                    : "Incomplete"
                  : ""
            }
            buttonText="Edit"
            reviews={financialStandingReviews}
            buttonOnClick={() =>
              router.push(
                `/${locale}/onboarding/company-documents/financial-standing`,
              )
            }
          />
        </div>
      </div>

      <div className="inset-x-0 bottom-0 z-50 mt-10 flex flex-col-reverse justify-end gap-4 bg-white p-4 md:fixed md:flex-row lg:static lg:bg-transparent lg:p-0 lg:shadow-none">
        <Button
          type="button"
          variant="ghost"
          className="text-primary h-12 w-full rounded-xl bg-transparent px-12 font-bold hover:bg-[#F5F5F5] hover:text-[hsl(var(--text-dark))] lg:w-48 lg:bg-[#F5F5F5] lg:text-[hsl(var(--text-dark))]"
          onClick={() =>
            router.push(
              `/${locale}/onboarding/company-documents/financial-standing`,
            )
          }
        >
          {t("common.back")}
        </Button>
        <Button
          type="button"
          className="h-12 w-full rounded-xl px-10 font-bold lg:w-48"
          onClick={isSubmissionAllowed() ? onSubmit : onSaveAndExit}
          disabled={isPending || isPendingSubmit}
        >
          {isPending || isPendingSubmit ? (
            <Loader2 className="size-4 animate-spin" />
          ) : isSubmissionAllowed() ? (
            t("common.submit")
          ) : (
            t("common.save_as_draft")
          )}
        </Button>
      </div>
    </div>
  );
}
