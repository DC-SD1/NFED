/**
 * High-level buckets of KYC documents used across the onboarding experience.
 */
export type KycDocumentSection = "corporateIdentity" | "authorizedRepresentative" | "financial";

/**
 * Field identifiers persisted in the onboarding store for corporate identity documents.
 */
export const CORPORATE_FIELD_NAMES = [
  "businessIncorporationDocs",
  "proofOfBusinessAddress",
  "corporateProfileOrBrochure",
] as const;

export type CorporateIdentityField = (typeof CORPORATE_FIELD_NAMES)[number];

/**
 * Field identifiers persisted in the onboarding store for authorized representative documents.
 */
export const AUTHORIZED_REP_FIELD_NAMES = [
  "idOfApplicant",
  "idOfShareholders",
  "certificateOfIncorporation",
] as const;

export type AuthorizedRepresentativeField = (typeof AUTHORIZED_REP_FIELD_NAMES)[number];

/**
 * Field identifiers persisted in the onboarding store for financial standing documents.
 */
export const FINANCIAL_FIELD_NAMES = [
  "auditedFinancialStatements",
  "bankReferenceLetter",
  "creditRatingReport",
  "proofOfFunds",
  "shippingRecords",
] as const;

export type FinancialStandingField = (typeof FINANCIAL_FIELD_NAMES)[number];

export type KycDocumentField =
  | CorporateIdentityField
  | AuthorizedRepresentativeField
  | FinancialStandingField;

/**
 * Declarative description of a single document requirement in the onboarding flow.
 */
export interface KycDocumentDefinition {
  readonly section: KycDocumentSection;
  readonly fieldName: KycDocumentField;
  readonly apiNames: readonly string[];
  readonly title: string;
  readonly resubmitPath: string;
}

/** Corporate identity document requirements. */
const CORPORATE_IDENTITY_DEFINITIONS: readonly KycDocumentDefinition[] = [
  {
    section: "corporateIdentity",
    fieldName: "businessIncorporationDocs",
    apiNames: ["corporate_identity"],
    title: "Business incorporation docs",
    resubmitPath: "/onboarding/company-documents/corporate-identity",
  },
  {
    section: "corporateIdentity",
    fieldName: "proofOfBusinessAddress",
    apiNames: ["proof_of_business_address", "proof_of_address"],
    title: "Proof of business address",
    resubmitPath: "/onboarding/company-documents/corporate-identity",
  },
  {
    section: "corporateIdentity",
    fieldName: "corporateProfileOrBrochure",
    apiNames: ["corporate_profile_or_brochure", "corporate_profile"],
    title: "Corporate profile/ brochure",
    resubmitPath: "/onboarding/company-documents/corporate-identity",
  },
] as const;

/** Authorized representative document requirements. */
const AUTHORIZED_REP_DEFINITIONS: readonly KycDocumentDefinition[] = [
  {
    section: "authorizedRepresentative",
    fieldName: "idOfApplicant",
    apiNames: ["authorized_representative", "id_of_applicant"],
    title: "ID of applicant",
    resubmitPath: "/onboarding/company-documents/authorized-representative",
  },
  {
    section: "authorizedRepresentative",
    fieldName: "idOfShareholders",
    apiNames: ["id_of_shareholders"],
    title: "ID's of shareholders",
    resubmitPath: "/onboarding/company-documents/authorized-representative",
  },
  {
    section: "authorizedRepresentative",
    fieldName: "certificateOfIncorporation",
    apiNames: ["certificate_of_incorporation"],
    title: "Certificate of incorporation",
    resubmitPath: "/onboarding/company-documents/authorized-representative",
  },
] as const;

/** Financial standing document requirements. */
const FINANCIAL_STANDING_DEFINITIONS: readonly KycDocumentDefinition[] = [
  {
    section: "financial",
    fieldName: "auditedFinancialStatements",
    apiNames: ["audited_financial_statements"],
    title: "Audited financial statements",
    resubmitPath: "/onboarding/company-documents/financial-standing",
  },
  {
    section: "financial",
    fieldName: "bankReferenceLetter",
    apiNames: ["bank_reference_letter"],
    title: "Bank reference letter",
    resubmitPath: "/onboarding/company-documents/financial-standing",
  },
  {
    section: "financial",
    fieldName: "creditRatingReport",
    apiNames: ["credit_rating_report"],
    title: "Credit rating report",
    resubmitPath: "/onboarding/company-documents/financial-standing",
  },
  {
    section: "financial",
    fieldName: "proofOfFunds",
    apiNames: ["proof_of_funds"],
    title: "Proof of funds",
    resubmitPath: "/onboarding/company-documents/financial-standing",
  },
  {
    section: "financial",
    fieldName: "shippingRecords",
    apiNames: ["shipping_records"],
    title: "Shipping records",
    resubmitPath: "/onboarding/company-documents/financial-standing",
  },
] as const;

/**
 * Flat list of every KYC document definition, regardless of section.
 */
export const KYC_DOCUMENT_DEFINITIONS: readonly KycDocumentDefinition[] = [
  ...CORPORATE_IDENTITY_DEFINITIONS,
  ...AUTHORIZED_REP_DEFINITIONS,
  ...FINANCIAL_STANDING_DEFINITIONS,
] as const;

/**
 * Quick lookup of document definitions grouped by onboarding section.
 */
export const DOCUMENTS_BY_SECTION: Record<
  KycDocumentSection,
  readonly KycDocumentDefinition[]
> = {
  corporateIdentity: CORPORATE_IDENTITY_DEFINITIONS,
  authorizedRepresentative: AUTHORIZED_REP_DEFINITIONS,
  financial: FINANCIAL_STANDING_DEFINITIONS,
};

/**
 * Lookup table translating API identifiers to document definitions.
 */
export const DOCUMENT_DEFINITION_BY_API_NAME: Record<string, KycDocumentDefinition> =
  KYC_DOCUMENT_DEFINITIONS.reduce<Record<string, KycDocumentDefinition>>(
    (acc, definition) => {
      definition.apiNames.forEach((apiName) => {
        acc[apiName] = definition;
      });
      return acc;
    },
    {},
  );

/**
 * Lookup table translating onboarding store field names to document definitions.
 */
export const DOCUMENT_DEFINITION_BY_FIELD: Record<
  KycDocumentField,
  KycDocumentDefinition
> = KYC_DOCUMENT_DEFINITIONS.reduce<Record<KycDocumentField, KycDocumentDefinition>>(
  (acc, definition) => {
    acc[definition.fieldName] = definition;
    return acc;
  },
  {} as Record<KycDocumentField, KycDocumentDefinition>,
);

/** All document field identifiers used within the onboarding store. */
export const ALL_DOCUMENT_FIELDS: readonly KycDocumentField[] = [
  ...CORPORATE_FIELD_NAMES,
  ...AUTHORIZED_REP_FIELD_NAMES,
  ...FINANCIAL_FIELD_NAMES,
];
