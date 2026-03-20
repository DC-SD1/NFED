"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import type { KycResponse, UserRequest } from "@/types/all-request.types";

import { createSelectors } from "../create-selectors";

interface State {
  requestData?: UserRequest;
  kycResponse: KycResponse;
  setRequestData: (data: UserRequest) => void;
  setKycResponse: (data: KycResponse) => void;
  setDocumentStatus: (
    type:
      | "grower_local_documents"
      | "grower_intl_documents"
      | "corp_identity"
      | "finance"
      | "auth_rep"
      | "certification",
    fileName: string,
    status: "Pending" | "Accepted" | "Declined" | undefined,
  ) => void;
  setDocumentDeclineReason: (
    type:
      | "grower_local_documents"
      | "grower_intl_documents"
      | "corp_identity"
      | "finance"
      | "auth_rep"
      | "certification",
    fileName: string,
    reason?: string,
  ) => void;

  setDetailStatus: (
    type: "grower_local" | "grower_intl",
    status: "Pending" | "Accepted" | "Declined" | undefined,
    reason?: string,
  ) => void;
  reset: () => void;
}

const useRequestStoreBase = create<State>()(
  persist(
    immer((set) => ({
      requestData: undefined,
      kycResponse: {},
      setRequestData: (data) => set({ requestData: data }),
      setKycResponse: (data) => set({ kycResponse: data }),
      setDocumentStatus: (type, fileName, status) =>
        set((state) => {
          const docs = state.kycResponse?.value?.documents?.[type];
          if (!docs) return;

          const doc = docs.find((d) => d.file_name === fileName);
          if (doc) {
            doc.document_status = status;
          }
        }),
      setDocumentDeclineReason: (type, fileName, reason) =>
        set((state) => {
          const docs = state.kycResponse?.value?.documents?.[type];
          if (!docs) return;

          const doc = docs.find((d) => d.file_name === fileName);
          if (doc) {
            doc.status_error_message = reason;
          }
        }),
      setDetailStatus: (type, status, reason) =>
        set((state) => {
          const detail = state.kycResponse?.value?.details?.[type];
          if (detail) {
            detail.details_status = status;
            if (reason || status === "Pending")
              detail.status_error_message = reason ?? null;
          }
        }),
      reset: () => set({ requestData: undefined, kycResponse: {} }),
    })),
    {
      name: "requests-store",
    },
  ),
);
const useRequestStore = createSelectors(useRequestStoreBase);

export default useRequestStore;
