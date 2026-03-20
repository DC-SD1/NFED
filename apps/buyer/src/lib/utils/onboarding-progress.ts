import { useOnboardingStore } from "@/lib/stores/onboarding-store";

interface OnboardingProgress {
  hasStarted: boolean;
  isComplete: boolean;
  isSubmitted: boolean;
  nextStep: string;
  buttonText: string;
  message: string;
}

export function getOnboardingProgress(): OnboardingProgress {
  const store = useOnboardingStore.getState();

  // Debug: Log store state to help troubleshoot
  console.log("Onboarding store state:", {
    hasDraft: store.hasDraft,
    hasSubmitted: store.hasSubmitted,
    organisationInformation: store.organisationInformation,
    cropInterest: store.cropInterest,
    corporateIdentity: store.corporateIdentity,
    authorizedRepresentative: store.authorizedRepresentative,
    financialStanding: store.financialStanding,
  });

  // Check if user has actually started onboarding (any section has data)
  const hasActualProgress =
    store.organisationInformation.organizationName.trim() !== "" ||
    store.cropInterest.crops.length > 0 ||
    store.corporateIdentity.businessIncorporationDocs.trim() !== "" ||
    store.authorizedRepresentative.idOfApplicant.trim() !== "" ||
    (Array.isArray(store.authorizedRepresentative.idOfShareholders)
      ? store.authorizedRepresentative.idOfShareholders.length > 0
      : false) ||
    store.financialStanding.auditedFinancialStatements.trim() !== "" ||
    store.financialStanding.bankReferenceLetter.trim() !== "" ||
    store.financialStanding.proofOfFunds.trim() !== "" ||
    store.financialStanding.shippingRecords.trim() !== "";

  console.log("Progress check:", {
    hasActualProgress,
    hasDraft: store.hasDraft,
    hasSubmitted: store.hasSubmitted,
    willShowStart: !hasActualProgress && !store.hasDraft,
  });

  // User has started if they have actual progress OR if they have a draft saved
  const _hasStarted = hasActualProgress || store.hasDraft;

  // If user has submitted, show submitted state regardless of section completeness
  if (store.hasSubmitted) {
    return {
      hasStarted: true,
      isComplete: true,
      isSubmitted: true,
      nextStep: "/home",
      buttonText: "Contact support",
      message:
        "Your KYC documents are under review and usually take about 48 hours. We’ll email you once they’re approved. Thanks for your patience!",
    };
  }

  // Check if all sections are complete (ready to submit)
  const isComplete = store.isAllSectionsComplete();

  if (isComplete) {
    return {
      hasStarted: true,
      isComplete: true,
      isSubmitted: false,
      nextStep: "/onboarding/review",
      buttonText: "Review your onboarding",
      message:
        "Your KYC onboarding is complete! Review your information before submitting.",
    };
  }

  // If no actual progress and no draft, show "Start"
  if (!hasActualProgress && !store.hasDraft) {
    return {
      hasStarted: false,
      isComplete: false,
      isSubmitted: false,
      nextStep: "/onboarding",
      buttonText: "Start your onboarding",
      message:
        "Access has been temporarily restricted. Start your KYC onboarding now to unlock all the features of your dashboard!",
    };
  }

  // Determine the next step based on progress
  let nextStep = "/onboarding/basic-information/organisation-information";

  if (!store.isOrganisationInformationComplete()) {
    nextStep = "/onboarding/basic-information/organisation-information";
  } else if (!store.isCropInterestComplete()) {
    nextStep = "/onboarding/basic-information/crop-interest";
  } else if (!store.isCorporateIdentityComplete()) {
    nextStep = "/onboarding/company-documents/corporate-identity";
  } else if (!store.isAuthorizedRepresentativeComplete()) {
    nextStep = "/onboarding/company-documents/authorized-representative";
  } else if (!store.isFinancialStandingComplete()) {
    nextStep = "/onboarding/company-documents/financial-standing";
  } else {
    nextStep = "/onboarding/review";
  }

  return {
    hasStarted: true,
    isComplete: false,
    isSubmitted: false,
    nextStep,
    buttonText: "Continue your onboarding",
    message:
      "Access has been temporarily restricted. Continue your KYC onboarding to unlock all the features of your dashboard!",
  };
}
