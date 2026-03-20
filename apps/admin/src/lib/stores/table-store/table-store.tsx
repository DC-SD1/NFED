"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { createSelectors } from "../create-selectors";

interface SelectedRow {
  id: string | number;
  data: any;
}

interface ExportType {
    type: string;
    isFilteringData: boolean;
    downloadUrl: string;
}

interface SelectedRowsState {
  rows: SelectedRow[];
  exportType?: ExportType | null;
  addRow: (row: SelectedRow) => void;
  removeRow: (id: string | number) => void;
  clearRows: () => void;
  setRows: (rows: SelectedRow[]) => void;
  setExportType: (exportType?: ExportType | null) => void;
}

const useTableStoreBase = create<SelectedRowsState>()(
  persist(
    immer((set) => ({
      rows: [],
      exportType: null,
      addRow: (row) =>
        set((state) => ({
          rows: [...state.rows, row],
        })),
      removeRow: (id) =>
        set((state) => ({
          rows: state.rows.filter((row) => row.id !== id),
        })),
      clearRows: () => set({ rows: [] }),
      setRows: (rows) =>
        set((state) => {
          state.rows = rows;
        }),
      setExportType: (exportType) =>
        set((state) => {
          state.exportType = exportType;
        }),
    })),
    {
      name: "table-store",
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(
            ([key]) => !["rows", "exportType"].includes(key), // don't store this in local storage
          ),
        ),
    },
  ),
);
const useTableStore = createSelectors(useTableStoreBase);

export default useTableStore;
