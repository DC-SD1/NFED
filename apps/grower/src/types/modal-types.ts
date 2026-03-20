import type { DocumentUploadResponse } from "@/lib/stores/upload-store";

export type ModalType =
  | "AddFarmManager"
  | "VideoPlayer"
  | "MobileAppPrompt"
  | "Error"
  | "UploadCoordinates"
  | "Success"
  | "SelectFarmLand"
  | "UpdatePhoneNumber"
  | "OtpVerification"
  | "UpdateKycDocuments"
  | "TermsAndConditions"
  | "Confirmation"
  | "LearningResourcesDrawer"
  | null;

export interface ModalData {
  termsAndConditionsLink?: string;
  termsAndConditionsBtnText?: string;
  fromContext?: string;
  video?: Video;
  // Error modal specific data
  errorTitle?: string;
  errorSubtitle?: string | React.ReactNode;
  errorDescription?: string;
  successTitle?: string;
  phoneNumber?: string;
  emailAddress?: string;
  numberChangeReason?: string;
  successDescription?: string;
  userType?: "Grower (Local)" | "Grower (International)";
  uploadDocType?: "id" | "passport" | "proofOfAddress" | "visa";
  proofOfAddressType?: "ghana_post_code" | "utility_bill" | "bank_statement";
  title?: string;
  subtitle?: string;
  inputLabel?: string;
  inputPlaceholder?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: (inputValue: string) => void;

  onCancel?: () => void;
  primaryButton?: {
    label: string;
    onClick: () => void;
    variant?:
      | "default"
      | "destructive"
      | "outline"
      | "secondary"
      | "ghost"
      | "link"
      | "unstyled";
  };
  farms?: any[];
  onFarmAssigned?: (farmId: string, farmName: string) => void;
  onDocumentUploaded?: (
    documentType: string,
    documentData: DocumentUploadResponse,
  ) => void;
  currentGhanaPostCode?: string;
  currentExpirationDate?: string;
  onKycDataUpdated?: (kycData: UpdatedKycData) => void;
  secondaryButton?: {
    label: string;
    onClick: () => void;
    variant?:
      | "default"
      | "destructive"
      | "outline"
      | "secondary"
      | "ghost"
      | "link"
      | "unstyled";
  };
}

export interface Video {
  title: string;
  videoUrl: string;
}

export interface UpdatedKycData {
  expirationDate?: string;
  ghanaPostCode?: string;
  proofOfAddressType?: string;
}
