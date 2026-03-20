import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface OrganisationInformation {
  organizationName: string;
  companySize: string;
  revenueRange: string;
}

export interface CropInterest {
  crops: string[];
  otherCrops?: string;
}

export interface CorporateIdentity {
  businessIncorporationDocs: string;
  proofOfBusinessAddress?: string;
  corporateProfileOrBrochure?: string;
}

export interface AuthorizedRepresentative {
  idOfApplicant: string;
  idOfShareholders: string[]; // allow multiple files
  certificateOfIncorporation?: string;
}

export interface FinancialStanding {
  auditedFinancialStatements: string;
  bankReferenceLetter: string;
  creditRatingReport?: string;
  proofOfFunds: string;
  shippingRecords: string;
}

interface OnboardingState {
  organisationInformation: OrganisationInformation;
  cropInterest: CropInterest;
  corporateIdentity: CorporateIdentity;
  authorizedRepresentative: AuthorizedRepresentative;
  financialStanding: FinancialStanding;
  hasDraft: boolean;
  hasSubmitted: boolean;
  // Track whether user attempted/skimmed steps so we can show incomplete status only after action
  attemptedAuthorizedRepresentative: boolean;
  attemptedFinancialStanding: boolean;
  // Explicit skip flags to distinguish skipped from attempted-but-incomplete
  skippedAuthorizedRepresentative: boolean;
  skippedFinancialStanding: boolean;
  // Track whether skip button should be enabled (no files uploaded)
  canSkipAuthorizedRepresentative: boolean;
  canSkipFinancialStanding: boolean;
  setOrganisationInformation: (data: OrganisationInformation) => void;
  setCropInterest: (data: CropInterest) => void;
  setCorporateIdentity: (data: CorporateIdentity) => void;
  setAuthorizedRepresentative: (data: AuthorizedRepresentative) => void;
  setFinancialStanding: (data: FinancialStanding) => void;
  setHasDraft: (value: boolean) => void;
  setHasSubmitted: (value: boolean) => void;
  setAttemptedAuthorizedRepresentative: (value: boolean) => void;
  setAttemptedFinancialStanding: (value: boolean) => void;
  setSkippedAuthorizedRepresentative: (value: boolean) => void;
  setSkippedFinancialStanding: (value: boolean) => void;
  setCanSkipAuthorizedRepresentative: (value: boolean) => void;
  setCanSkipFinancialStanding: (value: boolean) => void;
  reset: () => void;
  clearProgressAfterSubmit: () => void;
  clearAll: () => void;
  isOrganisationInformationComplete: () => boolean;
  isCropInterestComplete: () => boolean;
  isCorporateIdentityComplete: () => boolean;
  isAuthorizedRepresentativeComplete: () => boolean;
  isFinancialStandingComplete: () => boolean;
  isAllSectionsComplete: () => boolean;
  // Submission allowance per business rules around skipping AR/FS
  isSubmissionAllowed: () => boolean;
}

const initialState = {
  organisationInformation: {
    organizationName: "",
    companySize: "",
    revenueRange: "",
  },
  cropInterest: {
    crops: [],
    otherCrops: "",
  },
  corporateIdentity: {
    businessIncorporationDocs: "",
    proofOfBusinessAddress: "",
    corporateProfileOrBrochure: "",
  },
  authorizedRepresentative: {
    idOfApplicant: "",
    idOfShareholders: [],
    certificateOfIncorporation: "",
  },
  financialStanding: {
    auditedFinancialStatements: "",
    bankReferenceLetter: "",
    creditRatingReport: "",
    proofOfFunds: "",
    shippingRecords: "",
  },
  hasDraft: false,
  hasSubmitted: false,
  attemptedAuthorizedRepresentative: false,
  attemptedFinancialStanding: false,
  skippedAuthorizedRepresentative: false,
  skippedFinancialStanding: false,
  canSkipAuthorizedRepresentative: true,
  canSkipFinancialStanding: true,
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      ...initialState,
      setOrganisationInformation: (data) =>
        set((state) => ({
          ...state,
          organisationInformation: data,
        })),
      setCropInterest: (data) =>
        set((state) => ({ ...state, cropInterest: data })),
      setCorporateIdentity: (data) =>
        set((state) => ({ ...state, corporateIdentity: data })),
      setAuthorizedRepresentative: (data) =>
        set((state) => ({ ...state, authorizedRepresentative: data })),
      setFinancialStanding: (data) =>
        set((state) => ({ ...state, financialStanding: data })),
      setHasDraft: (value) => set((state) => ({ ...state, hasDraft: value })),
      setHasSubmitted: (value) =>
        set((state) => ({ ...state, hasSubmitted: value })),
      setAttemptedAuthorizedRepresentative: (value) =>
        set((state) => ({
          ...state,
          attemptedAuthorizedRepresentative: value,
        })),
      setAttemptedFinancialStanding: (value) =>
        set((state) => ({ ...state, attemptedFinancialStanding: value })),
      setSkippedAuthorizedRepresentative: (value) =>
        set((state) => ({ ...state, skippedAuthorizedRepresentative: value })),
      setSkippedFinancialStanding: (value) =>
        set((state) => ({ ...state, skippedFinancialStanding: value })),
      setCanSkipAuthorizedRepresentative: (value) =>
        set((state) => ({ ...state, canSkipAuthorizedRepresentative: value })),
      setCanSkipFinancialStanding: (value) =>
        set((state) => ({ ...state, canSkipFinancialStanding: value })),
      reset: () => set(initialState),
      clearProgressAfterSubmit: () =>
        set(() => ({
          ...initialState,
          hasSubmitted: true,
        })),
      clearAll: () => {
        // Clear localStorage and reset to initial state
        localStorage.removeItem("onboarding-storage");
        set(initialState);
      },
      isOrganisationInformationComplete: () => {
        const state = get();
        return (
          state.organisationInformation.organizationName.trim() !== "" &&
          state.organisationInformation.companySize.trim() !== "" &&
          state.organisationInformation.revenueRange.trim() !== ""
        );
      },
      isCropInterestComplete: () => {
        const state = get();
        return state.cropInterest.crops.length > 0;
      },
      isCorporateIdentityComplete: () => {
        const state = get();
        return state.corporateIdentity.businessIncorporationDocs.trim() !== "";
      },
      isAuthorizedRepresentativeComplete: () => {
        const state = get();
        const hasApplicant =
          state.authorizedRepresentative.idOfApplicant.trim() !== "";
        const hasShareholders =
          state.authorizedRepresentative.idOfShareholders.length > 0;
        return hasApplicant && hasShareholders;
      },
      isFinancialStandingComplete: () => {
        const state = get();
        return (
          state.financialStanding.auditedFinancialStatements.trim() !== "" &&
          state.financialStanding.bankReferenceLetter.trim() !== "" &&
          state.financialStanding.proofOfFunds.trim() !== "" &&
          state.financialStanding.shippingRecords.trim() !== ""
        );
      },
      isAllSectionsComplete: () => {
        const state = get();
        return (
          state.isOrganisationInformationComplete() &&
          state.isCropInterestComplete() &&
          state.isCorporateIdentityComplete() &&
          state.isAuthorizedRepresentativeComplete() &&
          state.isFinancialStandingComplete()
        );
      },
      // New selector implementing submission rules:
      // - If both AR and FS are skipped -> force save as draft (disallow submit)
      // - If one is skipped and the other is complete -> save as draft (disallow submit)
      // - If one is skipped and the other is started but incomplete -> disallow submit
      // - If one is partially filled (not complete) -> disallow submit (save as draft)
      // - Only allow submit when both AR and FS are complete (no skipping)
      isSubmissionAllowed: () => {
        const state = get();
        const baseComplete =
          state.isOrganisationInformationComplete() &&
          state.isCropInterestComplete() &&
          state.isCorporateIdentityComplete();

        if (!baseComplete) return false;

        const arComplete = state.isAuthorizedRepresentativeComplete();
        const fsComplete = state.isFinancialStandingComplete();
        const arSkipped = state.skippedAuthorizedRepresentative;
        const fsSkipped = state.skippedFinancialStanding;
        const arAttempted = state.attemptedAuthorizedRepresentative;
        const fsAttempted = state.attemptedFinancialStanding;

        // Both skipped -> force save as draft
        if (arSkipped && fsSkipped) return false;

        // One skipped, other complete -> save as draft
        if (arSkipped && fsComplete) return false;
        if (fsSkipped && arComplete) return false;

        // One skipped, other started but incomplete -> not allowed
        if (arSkipped && !fsComplete && fsAttempted)
          return false;
        if (fsSkipped && !arComplete && arAttempted)
          return false;

        // If one is partially filled (attempted but not complete) -> save as draft
        if (arAttempted && !arComplete) return false;
        if (fsAttempted && !fsComplete) return false;

        // Default: require both complete
        return arComplete && fsComplete;
      },
    }),
    {
      name: "onboarding-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        organisationInformation: state.organisationInformation,
        cropInterest: state.cropInterest,
        corporateIdentity: state.corporateIdentity,
        authorizedRepresentative: state.authorizedRepresentative,
        financialStanding: state.financialStanding,
        hasDraft: state.hasDraft,
        hasSubmitted: state.hasSubmitted,
        attemptedAuthorizedRepresentative:
          state.attemptedAuthorizedRepresentative,
        attemptedFinancialStanding: state.attemptedFinancialStanding,
        skippedAuthorizedRepresentative: state.skippedAuthorizedRepresentative,
        skippedFinancialStanding: state.skippedFinancialStanding,
        canSkipAuthorizedRepresentative: state.canSkipAuthorizedRepresentative,
        canSkipFinancialStanding: state.canSkipFinancialStanding,
      }),
    },
  ),
);
