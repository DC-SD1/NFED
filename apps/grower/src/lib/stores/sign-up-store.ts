import { create } from "zustand";
import { persist } from "zustand/middleware";

// Types for the sign-up flow
export type MarketingChannel =
  | "socialMedia"
  | "searchEngine"
  | "wordOfMouth"
  | "advertisement"
  | "newsMedia"
  | "other";

export type FarmingExperience = "newbie" | "experienced";

export interface BasicInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface NewbieData {
  workPreference?: "solo" | "manager";
  hasLand?: boolean;
  wantsTutorial?: boolean;
  location?: string;
  farmSize?: number;
  farmingMethod?: "greenhouse" | "openfield" | "notSure";
  farmingGoal?: "startGuidance" | "betterYields" | "export" | "investment";
}

export interface ExperiencedData {
  farmingLevel?:
    | "lessThanOneYear"
    | "oneToThreeYears"
    | "fourToSevenYears"
    | "moreThanEightYears";
  cropsCultivated?: string[];
  cropOtherOption?: string;
  farmingPreferenceOne?: "farmOnMyOwn" | "farmWithManager";
  farmingPreferenceTwo?: "yes" | "no";
  farmingPreferenceThree?: "yes" | "notNow";
  farmingMethod?: "greenhouse" | "openfield" | "notSure";
  farmingGoal?: "startGuidance" | "betterYields" | "export" | "investment";

  // Additional detailed data
  farmName?: string;
  farmSize?: number;
  sizeUnit?: "acres" | "hectares";
  yearsInOperation?: number;
  registrationNumber?: string;

  // Location & Climate
  country?: string;
  region?: string;
  nearestCity?: string;
  climateZone?: string;

  // Infrastructure
  irrigationType?: "drip" | "sprinkler" | "flood" | "rain_fed";
  hasStorage?: boolean;
  storageCapacity?: number;
  hasProcessing?: boolean;
  transportAccess?: "own" | "hired" | "public";
}

export interface SignUpStore {
  // Form data
  basicInfo: Partial<BasicInfo>;
  otpVerified: boolean;
  marketingChannels: MarketingChannel[];
  marketingChannelOther: string;
  farmingExperience: FarmingExperience | null;
  userSegment: FarmingExperience | null;
  newbieData: Partial<NewbieData>;
  experiencedData: Partial<ExperiencedData>;

  // Navigation state
  currentStep: number;
  totalSteps: number;

  // API data
  clerkUserId?: string;
  backendUserId?: string;

  // Registration state
  isRegistering: boolean;
  isInvite: boolean;

  // Actions
  setBasicInfo: (data: Partial<BasicInfo>) => void;
  setOtpVerified: (verified: boolean) => void;
  setIsInvite: (value: boolean) => void;
  setMarketingChannels: (channels: string[]) => void;
  setMarketingAttribution: (
    channels: MarketingChannel[],
    otherDetails?: string,
  ) => void;
  setFarmingExperience: (experience: FarmingExperience) => void;
  setUserSegment: (segment: FarmingExperience) => void;
  setNewbieData: (data: Partial<NewbieData>) => void;
  setExperiencedData: (data: Partial<ExperiencedData>) => void;
  setCurrentStep: (step: number) => void;
  setTotalSteps: (total: number) => void;
  setApiData: (data: { clerkUserId?: string; backendUserId?: string }) => void;
  setIsRegistering: (isRegistering: boolean) => void;

  // Utility
  resetFlow: () => void;
  clearBasicInfo: () => void;
  getFormData: () => any;
  getRegistrationData: () => {
    email: string;
    authId: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string | null;
  } | null;
  getOnboardingData: () => {
    marketingChannels: MarketingChannel[];
    marketingChannelOther?: string;
    farmingExperience: FarmingExperience | null;
    userSegment: FarmingExperience | null;
    experienceData: Partial<NewbieData> | Partial<ExperiencedData>;
  };
  isRegistrationReady: () => boolean;
  getCompleteUserProfile: () => {
    basicInfo: Partial<BasicInfo>;
    onboarding: {
      marketingChannels: MarketingChannel[];
      marketingChannelOther?: string;
      farmingExperience: FarmingExperience | null;
      userSegment: FarmingExperience | null;
      experienceData: Partial<NewbieData> | Partial<ExperiencedData>;
    };
    metadata: {
      clerkUserId?: string;
      backendUserId?: string;
      otpVerified: boolean;
    };
  };
}

const initialState = {
  basicInfo: {},
  otpVerified: false,
  marketingChannels: [] as MarketingChannel[],
  marketingChannelOther: "",
  farmingExperience: null,
  userSegment: null,
  newbieData: {},
  experiencedData: {},
  currentStep: 1,
  totalSteps: 4,
  isRegistering: false,
  isInvite: false,
};

export const useSignUpStore = create<SignUpStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setBasicInfo: (data: Partial<BasicInfo>) =>
        set((state) => ({
          basicInfo: { ...state.basicInfo, ...data },
        })),

      setOtpVerified: (verified: boolean) => set({ otpVerified: verified }),
      setIsInvite: (value: boolean) => set({ isInvite: value }),

      setMarketingChannels: (channels: string[]) =>
        set({
          marketingChannels: channels as MarketingChannel[],
        }),

      setMarketingAttribution: (
        channels: MarketingChannel[],
        otherDetails = "",
      ) =>
        set({
          marketingChannels: channels,
          marketingChannelOther: otherDetails,
        }),

      setFarmingExperience: (experience: FarmingExperience) =>
        set({
          farmingExperience: experience,
          totalSteps: experience === "newbie" ? 11 : 14, // Updated step counts
        }),

      setUserSegment: (segment: FarmingExperience) =>
        set({
          userSegment: segment,
          totalSteps: segment === "newbie" ? 11 : 14, // Updated step counts
        }),

      setNewbieData: (data: Partial<NewbieData>) =>
        set((state) => ({
          newbieData: { ...state.newbieData, ...data },
        })),

      setExperiencedData: (data: Partial<ExperiencedData>) =>
        set((state) => ({
          experiencedData: { ...state.experiencedData, ...data },
        })),

      setCurrentStep: (step: number) => set({ currentStep: step }),

      setTotalSteps: (total: number) => set({ totalSteps: total }),

      setApiData: (data: { clerkUserId?: string; backendUserId?: string }) =>
        set((state) => ({
          clerkUserId: data.clerkUserId || state.clerkUserId,
          backendUserId: data.backendUserId || state.backendUserId,
        })),

      setIsRegistering: (isRegistering: boolean) => set({ isRegistering }),

      resetFlow: () => set(initialState),

      clearBasicInfo: () =>
        set({
          basicInfo: initialState.basicInfo,
          otpVerified: initialState.otpVerified,
        }),

      getFormData: () => {
        const state = get();
        return {
          basicInfo: state.basicInfo,
          marketingChannels: state.marketingChannels,
          marketingChannelOther: state.marketingChannelOther,
          farmingExperience: state.farmingExperience,
          ...(state.farmingExperience === "newbie"
            ? { newbieData: state.newbieData }
            : { experiencedData: state.experiencedData }),
        };
      },

      getRegistrationData: () => {
        const state = get();
        const { email, firstName, lastName, phone } = state.basicInfo;
        const authId = state.clerkUserId;

        // Validate required fields
        if (!email || !authId || !firstName || !lastName) {
          return null;
        }

        return {
          email,
          authId,
          firstName,
          lastName,
          phoneNumber: phone || null,
        };
      },

      getOnboardingData: () => {
        const state = get();
        return {
          marketingChannels: state.marketingChannels,
          marketingChannelOther: state.marketingChannelOther,
          farmingExperience: state.farmingExperience,
          userSegment: state.userSegment,
          experienceData:
            state.farmingExperience === "newbie"
              ? state.newbieData
              : state.experiencedData,
        };
      },

      isRegistrationReady: () => {
        const state = get();
        const { email, firstName, lastName } = state.basicInfo;
        return !!(email && firstName && lastName && state.clerkUserId);
      },

      getCompleteUserProfile: () => {
        const state = get();
        return {
          basicInfo: state.basicInfo,
          onboarding: {
            marketingChannels: state.marketingChannels,
            marketingChannelOther: state.marketingChannelOther,
            farmingExperience: state.farmingExperience,
            userSegment: state.userSegment,
            experienceData:
              state.farmingExperience === "newbie"
                ? state.newbieData
                : state.experiencedData,
          },
          metadata: {
            clerkUserId: state.clerkUserId,
            backendUserId: state.backendUserId,
            otpVerified: state.otpVerified,
          },
        };
      },
    }),
    {
      name: "sign-up-storage",
      partialize: (state) => ({
        // Only persist non-sensitive data
        basicInfo: state.basicInfo,
        marketingChannels: state.marketingChannels,
        marketingChannelOther: state.marketingChannelOther,
        farmingExperience: state.farmingExperience,
        userSegment: state.userSegment,
        newbieData: state.newbieData,
        experiencedData: state.experiencedData,
        currentStep: state.currentStep,
        totalSteps: state.totalSteps,
        // IMPORTANT: We need to persist clerkUserId for registration to work
        clerkUserId: state.clerkUserId,
        // Note: password, otpVerified, isRegistering, and backendUserId are NOT persisted
      }),
    },
  ),
);
