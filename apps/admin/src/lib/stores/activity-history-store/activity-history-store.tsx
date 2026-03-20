"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import type { AuditLog } from "@/types/user-management.types";

import { createSelectors } from "../create-selectors";

interface Pager {
  currentPage: number;
  totalPages: number;
}

interface State {
  auditLogs: AuditLog[];
  pager: Pager;
  appendAuditLogs: (auditLogs: AuditLog[], page: Pager) => void;
  reset: () => void;
}

const useActivityHistoryStoreBase = create<State>()(
  persist(
    immer((set) => ({
      auditLogs: [],
      pager: { currentPage: 1, totalPages: 0 },
      appendAuditLogs: (auditLogs, pager) =>
        set((state) => ({
          auditLogs: [...state.auditLogs, ...auditLogs],
          pager,
        })),
      reset: () => set({ auditLogs: [] }),
    })),
    {
      name: "activity-history-store",
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(
            ([key]) => !["auditLogs", "pager"].includes(key), // don't store this in local storage
          ),
        ),
    },
  ),
);
const useActivityHistoryStore = createSelectors(useActivityHistoryStoreBase);

export default useActivityHistoryStore;
