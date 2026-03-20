import type { MultiPolygon, Polygon } from "geojson";
import { create } from "zustand";

export interface UploadedFile {
  name: string;
  size: number;
  type: string;
  progress: number;
  status: "uploading" | "success" | "error" | "idle";
  errorMessage?: string;
}

// Generic store interface
interface UploadStore<T = unknown> {
  file: UploadedFile | null;
  uploadResponse: T | null;
  fileFormat: string | undefined;
  setFile: (file: UploadedFile | null) => void;
  setUploadResponse: (response: T | null) => void;
  updateFileProgress: (progress: number) => void;
  updateFileStatus: (
    status: UploadedFile["status"],
    errorMessage?: string,
  ) => void;
  resetUpload: () => void;
}

// Factory function to create isolated store instances
function createUploadStore<T>() {
  return create<UploadStore<T>>((set) => ({
    file: null,
    uploadResponse: null,
    fileFormat: undefined,
    setFile: (file) => set({ file }),
    setFileFormat: (format: string) => set({ fileFormat: format }),
    setUploadResponse: (response) => set({ uploadResponse: response }),
    updateFileProgress: (progress) =>
      set((state) => ({
        file: state.file ? { ...state.file, progress } : null,
      })),
    updateFileStatus: (status, errorMessage) =>
      set((state) => ({
        file: state.file ? { ...state.file, status, errorMessage } : null,
      })),
    resetUpload: () =>
      set({ file: null, uploadResponse: null, fileFormat: undefined }),
  }));
}

// Specific store instances - completely isolated from each other
export const useFarmLandsUploadStore =
  createUploadStore<FarmLandsUploadResponse>();
export const useImageUploadStore = createUploadStore<ImageUploadResponse>();
export const useDocumentUploadStore =
  createUploadStore<DocumentUploadResponse>();

// Types for the responses
export interface FarmLandsUploadResponse {
  type: string;
  geometry: Polygon | MultiPolygon;
  properties: {
    name: string;
    description: string;
    centroidLongitude: number;
    centroidLatitude: number;
    areaSquareMeters: number;
    areaAcres: number;
    pointCount: number;
  };
}

// Example types for the responses
export interface ImageUploadResponse {
  id: string;
  url: string;
  filename: string;
  size: number;
  // ... other image-specific properties
}

// Types for document upload responses
export interface DocumentUploadResponse {
  id: string;
  filename: string;
  downloadUrl: string;
  size: number;
  type: string;
  uploadedAt: string;
}
