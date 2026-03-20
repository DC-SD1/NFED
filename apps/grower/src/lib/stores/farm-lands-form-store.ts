import { create } from "zustand";
import { persist } from "zustand/middleware";

export type LandOwnershipType = "LandTitle" | "ContractualAgreements" | null;

interface FarmLandsFormData {
  farmName: string;
  region: string;
  village: string;
  landOwnershipType: LandOwnershipType;
  documentUrl: string | null;
}

interface FarmLandsFormStore extends FarmLandsFormData {
  setFormData: (data: Partial<FarmLandsFormData>) => void;
  setFarmName: (farmName: string) => void;
  setRegion: (region: string) => void;
  setVillage: (village: string) => void;
  setLandOwnershipType: (type: LandOwnershipType) => void;
  setDocumentUrl: (url: string | null) => void;
  resetForm: () => void;
}

const initialState: FarmLandsFormData = {
  farmName: "",
  region: "",
  village: "",
  landOwnershipType: null,
  documentUrl: null,
};

export const useFarmLandsFormStore = create<FarmLandsFormStore>()(
  persist(
    (set) => ({
      ...initialState,
      setFormData: (data) => set((state) => ({ ...state, ...data })),
      setFarmName: (farmName) => set({ farmName }),
      setRegion: (region) => set({ region }),
      setVillage: (village) => set({ village }),
      setLandOwnershipType: (landOwnershipType) => set({ landOwnershipType }),
      setDocumentUrl: (documentUrl) => set({ documentUrl }),
      resetForm: () => set(initialState),
    }),
    {
      name: "farm-lands-form-storage",
    },
  ),
);