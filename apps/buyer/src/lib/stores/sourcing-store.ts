import type { useRouter } from "@bprogress/next/app";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/**
 * Interface for sourcing step data
 */
interface SourcingStep {
  /** The step identifier */
  id: string;
  /** The step title/label */
  title: string;
  /** The step href/path */
  href: string;
  /** Whether the step has been completed */
  isCompleted: boolean;
  /** Whether the step has been visited/attempted */
  isVisited: boolean;
}

/**
 * Interface for crop specification form data
 */
interface CropSpecificationData {
  /** Quantity in metric tonnes */
  quantity: number;
  /** Selected crop variety */
  cropVariety: string;
  /** Cultivation type */
  cultivationType: string;
  /** Grade selection */
  grade: string;
  /** Processing style */
  processingStyle: string;
  /** Packaging style */
  packagingStyle: string;
  /** Certification type */
  certificationType: string;
  /** Testing type */
  testingType: string;
}

/**
 * Interface for shipping method form data
 */
interface ShippingMethodData {
  /** Selected shipping method */
  shippingMethod?: "air" | "land" | "sea";
  /** Selected incoterm */
  incoterms?: "EXW" | "FCA" | "FAS" | "FOB" | "CFR" | "CIF";
  /** Selected country */
  country: string;
  /** Selected airport (for air shipping) */
  airport?: string;
  /** Selected seaport (for sea shipping) */
  seaport?: string;
  /** Delivery address (for land shipping) */
  deliveryAddress?: string;
  /** Preferred delivery timeline (available-crops only) */
  preferredDeliveryTimeline?: string;
  /** Additional documents list */
  additionalDocuments?: string[];
}

interface PaymentDetailsData {
  paymentMethod: string;
  paymentType: "full" | "installment";
  paymentTerm: { advance: string; balance: string };
}

type StepId =
  | "crop-specification"
  | "shipping-method"
  | "payment-details"
  | "document-processing"
  | "offer-review"
  | "sales-contract";

/**
 * Interface for sourcing store state
 */
interface SourcingState {
  /** Current active step index (0-based) */
  currentStep: number;
  /** Array of sourcing steps */
  steps: SourcingStep[];
  /** Whether the entire sourcing flow has been completed */
  isCompleted: boolean;
  /** Crop specification form data */
  cropSpecification: CropSpecificationData | null;
  /** Whether crop specification step is completed */
  isCropSpecificationCompleted: boolean;
  /** Shipping method form data */
  shippingMethod: ShippingMethodData | null;
  /** Whether shipping method step is completed */
  isShippingMethodCompleted: boolean;
  /** Real-time validation state for continue button */
  isCurrentStepValid: boolean;
  /** Payment details form data */
  paymentDetails: PaymentDetailsData | null;
  /** Whether payment details step is completed */
  isPaymentDetailsCompleted: boolean;
  /** Whether contract terms are accepted on sales contract step */
  areContractTermsAccepted: boolean;
  /** Available quantity for current product/order (in MT) */
  availableQuantity: number;
  /** Setter to update contract terms acceptance */
  setContractTermsAccepted: (accepted: boolean) => void;
  /** Co-signatory status for contract signing flow */
  coSignatoryStatus: "idle" | "pending" | "completed";
  /** Setter to update co-signatory status */
  setCoSignatoryStatus: (status: "idle" | "pending" | "completed") => void;
  /** Setter to update available quantity for validation/UI */
  setAvailableQuantity: (qty: number) => void;
  /** Whether cancel sourcing action is enabled for current step */
  isCancelSourcingEnabled: () => boolean;
  /** Setter for current step */
  setCurrentStep: (stepIndex: number) => void;
  /** Mark a step as completed */
  markStepCompleted: (stepId: string) => void;
  /** Mark a step as visited */
  markStepVisited: (stepId: string) => void;
  /** Reset a step's completion status */
  resetStep: (stepId: string) => void;
  /** Get step completion status */
  getStepStatus: (stepId: string) => "completed" | "active" | "inactive";
  /** Save crop specification data */
  saveCropSpecification: (data: CropSpecificationData) => void;
  saveAvailableCropSpecification: (data: CropSpecificationData) => void;
  /** Check if crop specification is valid */
  isCropSpecificationValid: (data: Partial<CropSpecificationData>) => boolean;
  isAvailableCropSpecificationValid: (
    data: Partial<CropSpecificationData>,
  ) => boolean;
  /** Save shipping method data */
  saveShippingMethod: (data: ShippingMethodData) => void;
  /** Save payment details data */
  savePaymentDetails: (data: PaymentDetailsData) => void;
  /** Check if shipping method is valid */
  isShippingMethodValid: (data: Partial<ShippingMethodData>) => boolean;
  /** Check if payment details is valid */
  isPaymentDetailsValid: (data: Partial<PaymentDetailsData>) => boolean;
  /** Update validation state for current step */
  setCurrentStepValid: (isValid: boolean) => void;
  /** Check if current step can continue */
  canContinueCurrentStep: () => boolean;
  /** Save current step data and continue */
  saveAndContinue: () => Promise<boolean>;
  /** Replace steps from provided nav items (keeps progress by step id) */
  setStepsFromNavItems: (items: { label: string; href: string }[]) => void;
  /** Go to a specific step only if it is completed; returns success */
  goToStep: (stepId: StepId, router: ReturnType<typeof useRouter>) => void;
  /** Reset the sourcing flow */
  reset: () => void;
  /** Clear all progress */
  clearAll: () => void;
}

/**
 * Initial sourcing steps configuration
 */
const initialSteps: SourcingStep[] = [
  {
    id: "crop-specification",
    title: "Crop specification",
    href: "/sourcing/personalised-crops/crop-specification",
    isCompleted: false,
    isVisited: false,
  },
  {
    id: "shipping-method",
    title: "Shipping method",
    href: "/sourcing/personalised-crops/shipping-method",
    isCompleted: false,
    isVisited: false,
  },
  {
    id: "payment-details",
    title: "Payment details",
    href: "/sourcing/personalised-crops/payment-details",
    isCompleted: false,
    isVisited: false,
  },
  {
    id: "sourcing-review",
    title: "Sourcing review",
    href: "/sourcing/personalised-crops/sourcing-review",
    isCompleted: false,
    isVisited: false,
  },
  {
    id: "document-processing",
    title: "Document processing",
    href: "/sourcing/personalised-crops/document-processing",
    isCompleted: false,
    isVisited: false,
  },
  {
    id: "offer-review",
    title: "Offer review",
    href: "/sourcing/personalised-crops/offer-review",
    isCompleted: false,
    isVisited: false,
  },
  {
    id: "sales-contract",
    title: "Sales contract",
    href: "/sourcing/personalised-crops/sales-contract",
    isCompleted: false,
    isVisited: false,
  },
];

/**
 * Initial state for the sourcing store
 */
const initialState = {
  currentStep: 0,
  steps: initialSteps,
  isCompleted: false,
  cropSpecification: null,
  isCropSpecificationCompleted: false,
  shippingMethod: null,
  isShippingMethodCompleted: false,
  isCurrentStepValid: false,
  paymentDetails: null,
  isPaymentDetailsCompleted: false,
  areContractTermsAccepted: false,
  coSignatoryStatus: "idle" as const,
  // NOTE: Placeholder default until fetched from product/order details
  availableQuantity: 30000,
};

/**
 * Sourcing store using Zustand with persistence
 */
export const useSourcingStore = create<SourcingState>()(
  persist(
    // eslint-disable-next-line max-lines-per-function
    (set, get) => ({
      ...initialState,
      /**
       * Update contract terms acceptance
       */
      setContractTermsAccepted: (accepted: boolean) => {
        set((state) => ({
          ...state,
          areContractTermsAccepted: accepted,
        }));
      },

      /**
       * Update co-signatory status for contract signing
       */
      setCoSignatoryStatus: (status) => {
        set((state) => ({
          ...state,
          coSignatoryStatus: status,
        }));
      },

      /**
       * Update available quantity for current product/order
       */
      setAvailableQuantity: (qty: number) => {
        set((state) => ({
          ...state,
          availableQuantity: Math.max(0, qty),
        }));
      },

      /**
       * Set the current active step
       */
      setCurrentStep: (stepIndex: number) => {
        set((state) => {
          const newCurrentStep = Math.max(
            0,
            Math.min(stepIndex, state.steps.length - 1),
          );
          const updatedSteps = state.steps.map((step, index) => ({
            ...step,
            isVisited: index <= newCurrentStep ? true : step.isVisited,
          }));

          return {
            ...state,
            currentStep: newCurrentStep,
            steps: updatedSteps,
          };
        });
      },

      /**
       * Mark a specific step as completed
       */
      markStepCompleted: (stepId: string) => {
        set((state) => {
          const updatedSteps = state.steps.map((step) =>
            step.id === stepId ? { ...step, isCompleted: true } : step,
          );

          // Check if all steps are completed
          const allCompleted = updatedSteps.every((step) => step.isCompleted);

          return {
            ...state,
            steps: updatedSteps,
            isCompleted: allCompleted,
          };
        });
      },

      /**
       * Mark a specific step as visited
       */
      markStepVisited: (stepId: string) => {
        set((state) => {
          const updatedSteps = state.steps.map((step) =>
            step.id === stepId ? { ...step, isVisited: true } : step,
          );

          return {
            ...state,
            steps: updatedSteps,
          };
        });
      },

      /**
       * Reset a specific step's completion status
       */
      resetStep: (stepId: string) => {
        set((state) => {
          const updatedSteps = state.steps.map((step) =>
            step.id === stepId
              ? { ...step, isCompleted: false, isVisited: false }
              : step,
          );

          return {
            ...state,
            steps: updatedSteps,
            // If any step becomes incomplete, sourcing flow is not fully completed
            isCompleted: updatedSteps.every((s) => s.isCompleted),
          };
        });
      },

      /**
       * Get the status of a specific step
       */
      getStepStatus: (stepId: string) => {
        const state = get();
        const stepIndex = state.steps.findIndex((step) => step.id === stepId);

        if (stepIndex === -1) return "inactive";

        const step = state.steps[stepIndex];
        const isCurrentStep = stepIndex === state.currentStep;

        if (step.isCompleted) return "completed";
        if (isCurrentStep) return "active";
        return "inactive";
      },

      /**
       * Save crop specification data
       */
      saveCropSpecification: (data: CropSpecificationData) => {
        set((state) => ({
          ...state,
          cropSpecification: data,
          isCropSpecificationCompleted: true,
        }));

        // Mark crop specification step as completed
        get().markStepCompleted("crop-specification");
      },

      saveAvailableCropSpecification: (data: CropSpecificationData) => {
        set((state) => ({
          ...state,
          cropSpecification: data,
          isCropSpecificationCompleted: true,
        }));

        // Mark crop specification step as completed
        get().markStepCompleted("crop-specification");
      },

      /**
       * Check if crop specification data is valid
       */
      isCropSpecificationValid: (data: Partial<CropSpecificationData>) => {
        const requiredFields: (keyof CropSpecificationData)[] = [
          "quantity",
          "cropVariety",
          "cultivationType",
          "grade",
          "processingStyle",
          "packagingStyle",
          "certificationType",
          "testingType",
        ];

        return requiredFields.every((field) => {
          const value = data[field];
          if (field === "quantity") {
            return typeof value === "number" && value > 0;
          }
          return value !== undefined && value !== null && value !== "";
        });
      },

      isAvailableCropSpecificationValid: (
        data: Partial<CropSpecificationData>,
      ) => {
        const state = get();
        const qty = data.quantity;
        return (
          typeof qty === "number" &&
          Number.isFinite(qty) &&
          qty > 0 &&
          qty <= state.availableQuantity
        );
      },

      /**
       * Save shipping method data
       */
      saveShippingMethod: (data: ShippingMethodData) => {
        set((state) => ({
          ...state,
          shippingMethod: data,
          isShippingMethodCompleted: true,
        }));

        // Mark shipping method step as completed
        get().markStepCompleted("shipping-method");
      },

      savePaymentDetails: (data: PaymentDetailsData) => {
        set((state) => ({
          ...state,
          paymentDetails: data,
          isPaymentDetailsCompleted: true,
        }));

        get().markStepCompleted("payment-details");
      },

      /**
       * Check if shipping method data is valid
       */
      isShippingMethodValid: (data: Partial<ShippingMethodData>) => {
        // Check required fields
        if (!data.shippingMethod || !data.incoterms || !data.country) {
          return false;
        }

        // Check conditional fields based on shipping method
        if (data.shippingMethod === "air") {
          return !!(data.airport && data.airport.trim() !== "");
        }

        if (data.shippingMethod === "sea") {
          return !!(data.seaport && data.seaport.trim() !== "");
        }

        if (data.shippingMethod === "land") {
          return !!(
            data.deliveryAddress && data.deliveryAddress.trim().length >= 10
          );
        }

        return false;
      },

      isPaymentDetailsValid: (data: Partial<PaymentDetailsData>) => {
        if (!data.paymentMethod || !data.paymentType) {
          return false;
        }

        if (data.paymentType === "full") {
          return true;
        }

        if (!data.paymentTerm) {
          return false;
        }

        const advance = Number((data.paymentTerm as any).advance);
        const balance = Number((data.paymentTerm as any).balance);

        if (!Number.isFinite(advance) || !Number.isFinite(balance)) {
          return false;
        }

        if (advance + balance !== 100) {
          return false;
        }

        if (advance < 30) {
          return false;
        }

        return true;
      },

      /**
       * Update validation state for current step
       */
      setCurrentStepValid: (isValid: boolean) => {
        set((state) => ({
          ...state,
          isCurrentStepValid: isValid,
        }));
      },

      /**
       * Whether the cancel sourcing button should be enabled on the current step
       */
      isCancelSourcingEnabled: () => {
        const state = get();
        const current = state.steps[state.currentStep];
        if (!current) return false;

        const cancelEnabledStepIds: readonly string[] = [
          "crop-specification",
          "shipping-method",
          "payment-details",
          "sourcing-review",
        ];

        return cancelEnabledStepIds.includes(current.id);
      },

      /**
       * Replace steps from provided nav items while preserving progress
       * This enables using the sourcing layout across different base routes
       * like /personalised-crops and /available-crops.
       */
      setStepsFromNavItems: (items: { label: string; href: string }[]) => {
        set((state) => {
          // Build new steps from nav items, keeping existing progress by id
          const newSteps: SourcingStep[] = items.map((item) => {
            const stepId =
              item.href.split("/").pop() ||
              item.label.toLowerCase().replace(/\s+/g, "-");
            const existing = state.steps.find((s) => s.id === stepId);
            return {
              id: stepId,
              title: item.label,
              href: item.href,
              isCompleted: existing ? existing.isCompleted : false,
              isVisited: existing ? existing.isVisited : false,
            };
          });

          const boundedCurrentStep = Math.max(
            0,
            Math.min(state.currentStep, newSteps.length - 1),
          );

          return {
            ...state,
            steps: newSteps,
            currentStep: boundedCurrentStep,
          };
        });
      },

      /**
       * Move to a specific step only if it has been completed
       */
      goToStep: (stepId: StepId, router: ReturnType<typeof useRouter>) => {
        const state = get();
        const targetStepIndex = state.steps.findIndex((s) => s.id === stepId);

        if (targetStepIndex === -1) return;
        const targetStep = state.steps[targetStepIndex];

        if (!targetStep.isCompleted) return;

        set((state) => {
          const updatedSteps = state.steps.map((step, index) => ({
            ...step,
            isVisited: index <= targetStepIndex ? true : step.isVisited,
          }));

          return {
            ...state,
            currentStep: targetStepIndex,
            steps: updatedSteps,
          };
        });

        router.push(targetStep.href);
      },

      /**
       * Check if current step can continue
       */
      canContinueCurrentStep: () => {
        const state = get();
        const currentStepData = state.steps[state.currentStep];

        if (!currentStepData) return false;

        // For crop specification step
        if (currentStepData.id === "crop-specification") {
          return state.isCurrentStepValid && state.isCropSpecificationCompleted;
        }

        // For shipping method step
        if (currentStepData.id === "shipping-method") {
          return state.isCurrentStepValid && state.isShippingMethodCompleted;
        }

        if (currentStepData.id === "payment-details") {
          return state.isCurrentStepValid && state.isPaymentDetailsCompleted;
        }

        // For placeholder steps (payment-details, etc.)
        // For now, allow continuation since they don't have forms yet
        // For other steps, use the validation state
        // return state.isCurrentStepValid;
        return true;
      },

      /**
       * Save current step data and continue
       */
      saveAndContinue: async () => {
        const state = get();
        const currentStepData = state.steps[state.currentStep];

        if (!currentStepData) return false;

        try {
          // For crop specification step, ensure data is saved
          if (currentStepData.id === "crop-specification") {
            if (
              state.cropSpecification &&
              state.isCropSpecificationValid(state.cropSpecification)
            ) {
              // Data is already saved via auto-save, just mark as completed
              get().markStepCompleted("crop-specification");
              return true;
            }
            return false;
          }

          // For shipping method step, ensure data is saved
          if (currentStepData.id === "shipping-method") {
            if (
              state.shippingMethod &&
              state.isShippingMethodValid(state.shippingMethod)
            ) {
              // Data is already saved via auto-save, just mark as completed
              get().markStepCompleted("shipping-method");
              return true;
            }
            return false;
          }

          if (currentStepData.id === "payment-details") {
            if (
              state.paymentDetails &&
              state.isPaymentDetailsValid(state.paymentDetails)
            ) {
              get().markStepCompleted("payment-details");
              return true;
            }

            return false;
          }

          if (currentStepData.id === "offer-review") {
            get().markStepCompleted("offer-review");
            return true;
          }

          if (currentStepData.id === "sales-contract") {
            if (state.coSignatoryStatus === "completed") {
              get().markStepCompleted("sales-contract");
              return true;
            }

            return false;
          }

          // For placeholder steps, just mark as completed
          if (
            ["sourcing-review", "document-processing"].includes(
              currentStepData.id,
            )
          ) {
            get().markStepCompleted(currentStepData.id);
            return true;
          }

          // For other steps, mark as completed if valid
          if (state.isCurrentStepValid) {
            get().markStepCompleted(currentStepData.id);
            return true;
          }

          return false;
        } catch (error) {
          console.error("Error saving step data:", error);
          return false;
        }
      },

      /**
       * Reset the sourcing flow to initial state
       */
      reset: () => set(initialState),

      /**
       * Clear all progress and localStorage
       */
      clearAll: () => {
        localStorage.removeItem("sourcing-storage");
        set(initialState);
      },
    }),
    {
      name: "sourcing-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentStep: state.currentStep,
        steps: state.steps,
        isCompleted: state.isCompleted,
        cropSpecification: state.cropSpecification,
        isCropSpecificationCompleted: state.isCropSpecificationCompleted,
        shippingMethod: state.shippingMethod,
        isShippingMethodCompleted: state.isShippingMethodCompleted,
        paymentDetails: state.paymentDetails,
        isPaymentDetailsCompleted: state.isPaymentDetailsCompleted,
        isCurrentStepValid: state.isCurrentStepValid,
        areContractTermsAccepted: state.areContractTermsAccepted,
        coSignatoryStatus: state.coSignatoryStatus,
        availableQuantity: state.availableQuantity,
      }),
    },
  ),
);
