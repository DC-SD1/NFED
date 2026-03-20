"use client";

import * as localforage from "localforage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import type { ImageProps } from "@/components/file-upload/multi-photo-uploader";

import { createSelectors } from "../create-selectors";

const fileStorage = localforage.createInstance({
  name: "myApp",
  storeName: "files",
});

export interface FormDataProps {
  name: string;
  country: string;
  phoneNumber: string;
  locationAddress: string;
  coordinate: {
    /** Format: double */
    longitude?: number;
    /** Format: double */
    latitude?: number;
  };
  googleMapLink: string;
  focusCrops: string[];
  region: string;
  assignedDistricts: string[];
  photos: ImageProps[];
  regionalManagerId: string;
  operationsDirectorId?: string;
  warehouseManagerId?: string;
  fieldAgronomistId?: string;
  fieldCoordinatorId?: string;
  selectedRom?: { value: string; label: string; [key: string]: any };
  selectedOd?: { value: string; label: string; [key: string]: any };
  selectedWm?: { value: string; label: string; [key: string]: any };
  selectedFa?: { value: string; label: string; [key: string]: any };
  selectedFc?: { value: string; label: string; [key: string]: any };
}

// Minimal type definition to avoid circular imports if FulfilmentCenter is complex
// In a real app we'd import the full type
interface SimpleFulfilmentCenter {
  id: string;
  name: string;
  country: string;
  locationAddress: string;
  phoneNumber: string;
  managers: { fullName: string; role: string }[];
  status: string;
  region?: string;
  focusCrops?: string[];
  assignedDistricts?: string[];
  googleMapLink?: string;
  photos?: string[];
}

interface State {
  cacheFormData: FormDataProps;
  customFulfilmentCenters: SimpleFulfilmentCenter[];
  setFormData: (formData: Partial<FormDataProps>) => void;
  addCustomFulfilmentCenter: (center: SimpleFulfilmentCenter) => void;
  updateCustomFulfilmentCenter: (
    id: string,
    updates: Partial<SimpleFulfilmentCenter>,
  ) => void;
  reset: () => void;
}

const useFulfilmentCenterStoreBase = create<State>()(
  persist(
    immer((set) => ({
      cacheFormData: {
        name: "",
        country: "",
        phoneNumber: "",
        locationAddress: "",
        coordinate: {
          longitude: 0,
          latitude: 0,
        },
        googleMapLink: "",
        focusCrops: [],
        region: "",
        assignedDistricts: [],
        photos: [],
        regionalManagerId: "",
      },
      customFulfilmentCenters: [],
      setFormData: (data) =>
        set((state) => {
          Object.assign(state.cacheFormData, data);
        }),
      addCustomFulfilmentCenter: (center) =>
        set((state) => {
          state.customFulfilmentCenters.unshift(center);
        }),
      updateCustomFulfilmentCenter: (id, updates) =>
        set((state) => {
          const index = state.customFulfilmentCenters.findIndex(
            (c) => c.id === id,
          );
          if (index !== -1 && state.customFulfilmentCenters[index]) {
            Object.assign(state.customFulfilmentCenters[index], updates);
          }
        }),

      reset: () =>
        set((state) => {
          state.cacheFormData = {
            name: "",
            country: "",
            phoneNumber: "",
            locationAddress: "",
            coordinate: {
              longitude: 0,
              latitude: 0,
            },
            googleMapLink: "",
            focusCrops: [],
            region: "",
            assignedDistricts: [],
            photos: [],
            regionalManagerId: "",
          };
        }),
    })),
    {
      name: "fulfilment-center-store",
      storage: createJSONStorage(() => fileStorage),
    },
  ),
);
const useFulfilmentCenterStore = createSelectors(useFulfilmentCenterStoreBase);

export default useFulfilmentCenterStore;
