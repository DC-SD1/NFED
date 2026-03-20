export interface Crop {
  id: string;
  value: string;
  label: string;
  isRecommended?: boolean;
}

export interface SelectCropFormData {
  selectedCrop: string;
}

export interface SelectCropPageProps {
  crops: Crop[];
  recommendedCrops: Crop[];
}
