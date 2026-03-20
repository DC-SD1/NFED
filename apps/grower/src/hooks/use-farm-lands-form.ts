import { useFarmLandsFormStore } from "@/lib/stores/farm-lands-form-store";
import { useDocumentUploadStore } from "@/lib/stores/upload-store";

export function useFarmLandsForm() {
  // Document upload store selections
  const uploadResponse = useDocumentUploadStore(
    (state) => state.uploadResponse,
  );
  const file = useDocumentUploadStore((state) => state.file);
  const setUploadResponse = useDocumentUploadStore(
    (state) => state.setUploadResponse,
  );
  const resetUpload = useDocumentUploadStore((state) => state.resetUpload);
  const setFile = useDocumentUploadStore((state) => state.setFile);
  const updateFileStatus = useDocumentUploadStore(
    (state) => state.updateFileStatus,
  );
  const updateFileProgress = useDocumentUploadStore(
    (state) => state.updateFileProgress,
  );

  // Form store selections
  const farmName = useFarmLandsFormStore((state) => state.farmName);
  const region = useFarmLandsFormStore((state) => state.region);
  const village = useFarmLandsFormStore((state) => state.village);
  const landOwnershipType = useFarmLandsFormStore(
    (state) => state.landOwnershipType,
  );
  const documentUrl = useFarmLandsFormStore((state) => state.documentUrl);
  const setFormData = useFarmLandsFormStore((state) => state.setFormData);
  const setLandOwnershipType = useFarmLandsFormStore(
    (state) => state.setLandOwnershipType,
  );
  const setDocumentUrl = useFarmLandsFormStore((state) => state.setDocumentUrl);

  return {
    // Upload store values
    uploadResponse,
    file,
    setUploadResponse,
    resetUpload,
    setFile,
    updateFileStatus,
    updateFileProgress,
    // Form store values
    farmName,
    region,
    village,
    landOwnershipType,
    documentUrl,
    setFormData,
    setLandOwnershipType,
    setDocumentUrl,
  };
}