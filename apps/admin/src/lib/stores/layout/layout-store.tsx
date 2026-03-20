"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { createSelectors } from "../create-selectors";

interface LayoutState {
  selectedTab: string;
  rightSidebarOpen: boolean;
  reset: () => void;
  setTab: (value: string) => void;
  setRightSidebarOpen: (value: boolean) => void;
}

const useLayoutBase = create<LayoutState>()(
  persist(
    immer((set) => ({
      selectedTab: "",
      rightSidebarOpen: true,
      setTab: (value) =>
        set((state) => {
          state.selectedTab = value;
        }),
      setRightSidebarOpen: (value) =>
        set((state) => {
          state.rightSidebarOpen = value;
        }),
      reset: () => set({ selectedTab: "" }),
    })),
    {
      name: "layout-store",
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(
            ([key]) => !["rightSidebarOpen"].includes(key), // don't store this in local storage
          ),
        ),
    },
  ),
);
const useLayoutStore = createSelectors(useLayoutBase);

export default useLayoutStore;
