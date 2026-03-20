"use client";
import LearningResourcesDrawer from "@/components/dashboard/learning-resources-drawer";
import ConfirmationModal from "@/components/modals/confirmation-modal";
import ErrorModal from "@/components/modals/error-modal";
import MobileAppPromptModal from "@/components/modals/mobile-app-prompt-modal";
import OtpModal from "@/components/modals/otp-modal";
import SelectFarmLandModal from "@/components/modals/select-farm-land-modal";
import SelectFarmManagerOptionModal from "@/components/modals/select-farm-manager-option";
import SuccessModal from "@/components/modals/success-modal";
import TermsAndConditionsModal from "@/components/modals/terms-and-conditions";
import UpdatePhoneNumberModal from "@/components/modals/update-number-modal";
import UploadCoordinatesModal from "@/components/modals/upload-coordinates-modal";
import UploadDocModal from "@/components/modals/upload-doc-modal";
import VideoPlayerModal from "@/components/modals/video-player-modal";

export const ModalProvider = () => {
  return (
    <>
      <SelectFarmManagerOptionModal />
      <SelectFarmLandModal />
      <VideoPlayerModal />
      <MobileAppPromptModal />
      <ErrorModal />
      <UploadCoordinatesModal />
      <SuccessModal />
      <UpdatePhoneNumberModal />
      <OtpModal />
      <UploadDocModal />
      <TermsAndConditionsModal />
      <ConfirmationModal />
      <LearningResourcesDrawer />
    </>
  );
};
