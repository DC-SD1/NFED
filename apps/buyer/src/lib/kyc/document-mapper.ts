/**
 * Utilities for transforming KYC API responses into review-friendly document models.
 */

import type { DocumentData } from "@/app/[locale]/onboarding/review/[id]/_components/document-list";
import {
  type AuthorizedRepresentativeField,
  type CorporateIdentityField,
  DOCUMENT_DEFINITION_BY_API_NAME,
  type FinancialStandingField,
  type KycDocumentDefinition,
  type KycDocumentField,
  type KycDocumentSection,
} from "@/lib/kyc/document-config";
import type {
  AuthorizedRepresentative,
  CorporateIdentity,
  FinancialStanding,
} from "@/lib/stores/onboarding-store";

const STATIC_FALLBACK_EXTENSION = "pdf";

interface ApiDocument {
  file_name?: string | null;
  file_url?: string | null;
  document_status?: string | number | null;
  status_error_message?: string | null;
}

interface ApiDocumentGroup {
  corp_identity?: readonly ApiDocument[] | null;
  finance?: readonly ApiDocument[] | null;
  auth_rep?: readonly ApiDocument[] | null;
}

interface MapKycDocumentsParams {
  locale: string;
  kycId?: string | null;
  apiDocuments?: ApiDocumentGroup | null;
  corporateIdentity: CorporateIdentity;
  authorizedRepresentative: AuthorizedRepresentative;
  financialStanding: FinancialStanding;
  uploadingFields?: ReadonlySet<KycDocumentField>;
}

type SectionDocuments = Record<KycDocumentSection, DocumentData[]>;

const DEFAULT_SECTION_DOCUMENTS: SectionDocuments = {
  corporateIdentity: [],
  financial: [],
  authorizedRepresentative: [],
};

const mapDocumentStatus = (apiStatus?: string | number | null): "approved" | "pending" | "rejected" => {
  if (apiStatus === "Accepted") return "approved";
  if (apiStatus === "Declined") return "rejected";
  return "pending";
};

const getFilenameFromUrl = (url?: string | null) => {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname ?? "";
    const last = pathname.split("/").filter(Boolean).pop();
    return last ?? null;
  } catch {
    const parts = url.split("/").filter(Boolean);
    return parts.pop() ?? null;
  }
};

const getPreferredFilename = (apiDoc: ApiDocument, definition: KycDocumentDefinition) => {
  const fromUrl = getFilenameFromUrl(apiDoc.file_url);
  if (fromUrl) return fromUrl;
  if (apiDoc.file_name && apiDoc.file_name.trim().length > 0) {
    return apiDoc.file_name;
  }
  return `${definition.fieldName}.${STATIC_FALLBACK_EXTENSION}`;
};

const buildResubmitHref = (definition: KycDocumentDefinition, locale: string, kycId?: string | null) => {
  const query = kycId && kycId.trim().length > 0 ? `?kycId=${kycId}` : "";
  return `/${locale}${definition.resubmitPath}${query}`;
};

const valueMatchesApiReference = (value: string | string[] | undefined, apiDoc: ApiDocument) => {
  if (!value) return false;
  const apiUrl = apiDoc.file_url ?? apiDoc.file_name ?? "";
  if (!apiUrl) return false;

  if (Array.isArray(value)) {
    return value.some((entry) => entry && apiUrl && entry === apiUrl);
  }

  return value === apiUrl;
};

const valueHasUpload = (value: string | string[] | undefined) => {
  if (!value) return false;
  if (Array.isArray(value)) {
    return value.some((entry) => entry && entry.trim().length > 0);
  }
  return value.trim().length > 0;
};

const getStoreValueForDefinition = (
  definition: KycDocumentDefinition,
  params: MapKycDocumentsParams,
): string | string[] | undefined => {
  switch (definition.section) {
    case "corporateIdentity":
      return params.corporateIdentity[
        definition.fieldName as CorporateIdentityField
      ];
    case "authorizedRepresentative":
      return params.authorizedRepresentative[
        definition.fieldName as AuthorizedRepresentativeField
      ];
    case "financial":
      return params.financialStanding[
        definition.fieldName as FinancialStandingField
      ];
    default:
      return undefined;
  }
};

const mapDocument = (
  apiDoc: ApiDocument,
  index: number,
  definition: KycDocumentDefinition,
  params: MapKycDocumentsParams,
): DocumentData => {
  const storeValue = getStoreValueForDefinition(definition, params);

  const hasUpload = valueHasUpload(storeValue);
  const matchesApi = valueMatchesApiReference(storeValue, apiDoc);
  const uploadFlag = hasUpload && !matchesApi;

  return {
    id: `${definition.apiNames[0] ?? definition.fieldName}-${index}`,
    title: definition.title,
    filename: getPreferredFilename(apiDoc, definition),
    status: mapDocumentStatus(apiDoc.document_status),
    errorMessage:
      apiDoc.document_status === "Declined"
        ? apiDoc.status_error_message ?? "This document was declined and needs to be resubmitted."
        : undefined,
    resubmitHref: buildResubmitHref(definition, params.locale, params.kycId ?? undefined),
    fieldName: definition.fieldName,
    uploadValue: storeValue,
    hasUpdatedUpload: uploadFlag,
    isUploading: params.uploadingFields?.has(definition.fieldName) ?? false,
  };
};

export const mapKycDocuments = (params: MapKycDocumentsParams): SectionDocuments => {
  if (!params.apiDocuments) {
    return DEFAULT_SECTION_DOCUMENTS;
  }

  const result: SectionDocuments = {
    corporateIdentity: [],
    financial: [],
    authorizedRepresentative: [],
  };

  (params.apiDocuments.corp_identity ?? []).forEach((doc, index) => {
    const definition = DOCUMENT_DEFINITION_BY_API_NAME[(doc.file_name ?? "").toLowerCase()];
    if (!definition || definition.section !== "corporateIdentity") return;
    result.corporateIdentity.push(mapDocument(doc, index, definition, params));
  });

  (params.apiDocuments.finance ?? []).forEach((doc, index) => {
    const definition = DOCUMENT_DEFINITION_BY_API_NAME[(doc.file_name ?? "").toLowerCase()];
    if (!definition || definition.section !== "financial") return;
    result.financial.push(mapDocument(doc, index, definition, params));
  });

  (params.apiDocuments.auth_rep ?? []).forEach((doc, index) => {
    const definition = DOCUMENT_DEFINITION_BY_API_NAME[(doc.file_name ?? "").toLowerCase()];
    if (!definition || definition.section !== "authorizedRepresentative") return;
    result.authorizedRepresentative.push(mapDocument(doc, index, definition, params));
  });

  return result;
};
