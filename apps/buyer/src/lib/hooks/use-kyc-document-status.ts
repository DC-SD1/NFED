"use client";

import { useLocale } from "next-intl";

import { useKycData } from "./use-kyc-data";

/**
 * Custom hook for managing KYC document status for resubmission forms
 *
 * @param kycId - Optional KYC ID from query parameters (for resubmission forms)
 * @returns Object containing document status information for form controls
 */
export function useKycDocumentStatus(kycId?: string | null) {
  const locale = useLocale();
  const { documents, isPending } = useKycData(locale, kycId);

  // Determine if we are in a resubmission context (have KYC data)
  const isResubmissionFlow =
    documents.corporateIdentity.length > 0 ||
    documents.financial.length > 0 ||
    documents.authorizedRepresentative.length > 0;

  // Helper function to check if a document is accepted
  const isDocumentAccepted = (
    documentType: "corp_identity" | "finance" | "auth_rep",
    fieldName: string,
  ): boolean => {
    // If we're not in a resubmission context (no KYC data), all documents are enabled
    if (!isResubmissionFlow) return false;
    if (isPending) return false;

    const docList =
      documentType === "corp_identity"
        ? documents.corporateIdentity
        : documentType === "finance"
          ? documents.financial
          : documents.authorizedRepresentative;

    const doc = docList.find((d: any) =>
      d.title.toLowerCase().includes(fieldName.toLowerCase()),
    );
    const isAccepted = doc?.status === "approved";

    return isAccepted;
  };

  // Helper function to check if a document is declined
  const isDocumentDeclined = (
    documentType: "corp_identity" | "finance" | "auth_rep",
    fieldName: string,
  ): boolean => {
    // If we're not in a resubmission context (no KYC data), no documents are declined
    if (!isResubmissionFlow) return false;
    if (isPending) return false;

    const docList =
      documentType === "corp_identity"
        ? documents.corporateIdentity
        : documentType === "finance"
          ? documents.financial
          : documents.authorizedRepresentative;
    const doc = docList.find((d: any) =>
      d.title.toLowerCase().includes(fieldName.toLowerCase()),
    );
    const isDeclined = doc?.status === "rejected";

    return isDeclined;
  };

  // Helper function to check if a document needs resubmission
  const needsResubmission = (
    documentType: "corp_identity" | "finance" | "auth_rep",
    fieldName: string,
  ): boolean => {
    return isDocumentDeclined(documentType, fieldName);
  };

  // Helper function to get the filename of a document
  const getDocumentFilename = (
    documentType: "corp_identity" | "finance" | "auth_rep",
    fieldName: string,
  ): string | undefined => {
    if (!isResubmissionFlow) return undefined;
    if (isPending) return undefined;

    const docList =
      documentType === "corp_identity"
        ? documents.corporateIdentity
        : documentType === "finance"
          ? documents.financial
          : documents.authorizedRepresentative;

    const doc = docList.find((d: any) =>
      d.title.toLowerCase().includes(fieldName.toLowerCase()),
    );
    return doc?.filename;
  };

  // Corporate Identity document statuses
  const corporateIdentityStatus = {
    businessIncorporationDocs: {
      isAccepted: isDocumentAccepted(
        "corp_identity",
        "Business incorporation docs",
      ),
      isDeclined: isDocumentDeclined(
        "corp_identity",
        "Business incorporation docs",
      ),
      needsResubmission: needsResubmission(
        "corp_identity",
        "Business incorporation docs",
      ),
      disabled: isDocumentAccepted(
        "corp_identity",
        "Business incorporation docs",
      ), // Only disable if accepted
      filename: getDocumentFilename(
        "corp_identity",
        "Business incorporation docs",
      ),
    },
    proofOfBusinessAddress: {
      isAccepted: isDocumentAccepted(
        "corp_identity",
        "Proof of business address",
      ),
      isDeclined: isDocumentDeclined(
        "corp_identity",
        "Proof of business address",
      ),
      needsResubmission: needsResubmission(
        "corp_identity",
        "Proof of business address",
      ),
      disabled: isDocumentAccepted(
        "corp_identity",
        "Proof of business address",
      ), // Only disable if accepted
      filename: getDocumentFilename(
        "corp_identity",
        "Proof of business address",
      ),
    },
    corporateProfileOrBrochure: {
      isAccepted: isDocumentAccepted(
        "corp_identity",
        "Corporate profile/ brochure",
      ),
      isDeclined: isDocumentDeclined(
        "corp_identity",
        "Corporate profile/ brochure",
      ),
      needsResubmission: needsResubmission(
        "corp_identity",
        "Corporate profile/ brochure",
      ),
      disabled: isDocumentAccepted(
        "corp_identity",
        "Corporate profile/ brochure",
      ), // Only disable if accepted
      filename: getDocumentFilename(
        "corp_identity",
        "Corporate profile/ brochure",
      ),
    },
  };

  // Financial document statuses
  const financialStatus = {
    auditedFinancialStatements: {
      isAccepted: isDocumentAccepted("finance", "Audited financial statements"),
      isDeclined: isDocumentDeclined("finance", "Audited financial statements"),
      needsResubmission: needsResubmission(
        "finance",
        "Audited financial statements",
      ),
      disabled: isDocumentAccepted("finance", "Audited financial statements"), // Only disable if accepted
      filename: getDocumentFilename("finance", "Audited financial statements"),
    },
    bankReferenceLetter: {
      isAccepted: isDocumentAccepted("finance", "Bank reference letter"),
      isDeclined: isDocumentDeclined("finance", "Bank reference letter"),
      needsResubmission: needsResubmission("finance", "Bank reference letter"),
      disabled: isDocumentAccepted("finance", "Bank reference letter"), // Only disable if accepted
      filename: getDocumentFilename("finance", "Bank reference letter"),
    },
    creditRatingReport: {
      isAccepted: isDocumentAccepted("finance", "Credit rating report"),
      isDeclined: isDocumentDeclined("finance", "Credit rating report"),
      needsResubmission: needsResubmission("finance", "Credit rating report"),
      disabled: isDocumentAccepted("finance", "Credit rating report"), // Only disable if accepted
      filename: getDocumentFilename("finance", "Credit rating report"),
    },
    proofOfFunds: {
      isAccepted: isDocumentAccepted("finance", "Proof of funds"),
      isDeclined: isDocumentDeclined("finance", "Proof of funds"),
      needsResubmission: needsResubmission("finance", "Proof of funds"),
      disabled: isDocumentAccepted("finance", "Proof of funds"), // Only disable if accepted
      filename: getDocumentFilename("finance", "Proof of funds"),
    },
    shippingRecords: {
      isAccepted: isDocumentAccepted("finance", "Shipping records"),
      isDeclined: isDocumentDeclined("finance", "Shipping records"),
      needsResubmission: needsResubmission("finance", "Shipping records"),
      disabled: isDocumentAccepted("finance", "Shipping records"), // Only disable if accepted
      filename: getDocumentFilename("finance", "Shipping records"),
    },
  };

  // Authorized Representative document statuses
  const authorizedRepresentativeStatus = {
    idOfApplicant: {
      isAccepted: isDocumentAccepted("auth_rep", "ID of applicant"),
      isDeclined: isDocumentDeclined("auth_rep", "ID of applicant"),
      needsResubmission: needsResubmission("auth_rep", "ID of applicant"),
      disabled: isDocumentAccepted("auth_rep", "ID of applicant"), // Only disable if accepted
      filename: getDocumentFilename("auth_rep", "ID of applicant"),
    },
    idOfShareholders: {
      isAccepted: isDocumentAccepted("auth_rep", "ID's of shareholders"),
      isDeclined: isDocumentDeclined("auth_rep", "ID's of shareholders"),
      needsResubmission: needsResubmission("auth_rep", "ID's of shareholders"),
      disabled: isDocumentAccepted("auth_rep", "ID's of shareholders"), // Only disable if accepted
      filename: getDocumentFilename("auth_rep", "ID's of shareholders"),
    },
    certificateOfIncorporation: {
      isAccepted: isDocumentAccepted(
        "auth_rep",
        "Certificate of incorporation",
      ),
      isDeclined: isDocumentDeclined(
        "auth_rep",
        "Certificate of incorporation",
      ),
      needsResubmission: needsResubmission(
        "auth_rep",
        "Certificate of incorporation",
      ),
      disabled: isDocumentAccepted("auth_rep", "Certificate of incorporation"), // Only disable if accepted
      filename: getDocumentFilename("auth_rep", "Certificate of incorporation"),
    },
  };

  return {
    isPending,
    isResubmissionFlow,
    corporateIdentity: corporateIdentityStatus,
    financial: financialStatus,
    authorizedRepresentative: authorizedRepresentativeStatus,
  };
}
