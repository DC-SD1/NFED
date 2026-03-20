"use client";

import { create } from "zustand";

import type { ValidRole } from "@/lib/schemas/auth";

export interface InviteUserData {
  firstName: string;
  lastName: string;
  emailAddress: string;
  phoneNumber: string;
  role: ValidRole;
  experienceYears: number;
}

export interface ContractBase {
  farmManagerId: string;
  contractType: "fullTime" | "contractor";
  startDate: string;
  endDate: string | null;
  comments?: string;
}

export interface FarmContractData extends ContractBase {
  farmId: string;
}

interface InviteUserStore {
  inviteData: Partial<InviteUserData>;
  setInviteData: (data: Partial<InviteUserData>) => void;
  resetInviteData: () => void;
  getPostPayload: () => InviteUserData | null;

  draftContract: Partial<ContractBase>;
  setDraftContract: (data: Partial<ContractBase>) => void;
  resetDraftContract: () => void;

  farmContract: Partial<FarmContractData>;
  setFarmContract: (data: Partial<FarmContractData>) => void;
  resetFarmContract: () => void;

  workType: "fullTime" | "contractor" | null;
  setWorkType: (type: "fullTime" | "contractor") => void;

  workPayType: "payRoll" | "equityYield" | "hybrid" | null;
  setWorkPayType: (type: "payRoll" | "equityYield" | "hybrid") => void;
}

const initialInviteState: Partial<InviteUserData> = {
  firstName: "",
  lastName: "",
  emailAddress: "",
  phoneNumber: "",
  role: undefined,
  experienceYears: 0,
};

const initialDraftContract: Partial<ContractBase> = {
  farmManagerId: "",
  startDate: new Date().toISOString(),
  endDate: null,
  comments: "",
};

const initialFarmContract: Partial<FarmContractData> = {
  farmManagerId: "",
  startDate: new Date().toISOString(),
  endDate: "",
  comments: "",
  farmId: "",
};

export const useInviteUserStore = create<InviteUserStore>((set, get) => ({
  inviteData: initialInviteState,
  draftContract: initialDraftContract,
  farmContract: initialFarmContract,

  workType: null,
  setWorkType: (type) => set({ workType: type }),

  workPayType: null,
  setWorkPayType: (type) => set({ workPayType: type }),

  setInviteData: (data) =>
    set((state) => ({
      inviteData: { ...state.inviteData, ...data },
    })),

  resetInviteData: () => set({ inviteData: initialInviteState }),

  getPostPayload: () => {
    const data = get().inviteData;
    if (
      data.firstName &&
      data.lastName &&
      data.emailAddress &&
      data.phoneNumber &&
      data.role !== undefined &&
      typeof data.experienceYears === "number"
    ) {
      return data as InviteUserData;
    }
    return null;
  },

  setDraftContract: (data) => {
    const workType = get().workType;
    set((state) => ({
      draftContract: {
        ...state.draftContract,
        ...data,
        contractType: workType ?? undefined,
      },
    }));
  },

  resetDraftContract: () => set({ draftContract: initialDraftContract }),

  setFarmContract: (data) => {
    const workType = get().workType;
    set((state) => ({
      farmContract: {
        ...state.farmContract,
        ...data,
        contractType: workType ?? undefined,
      },
    }));
  },

  resetFarmContract: () => set({ farmContract: initialFarmContract }),
}));
