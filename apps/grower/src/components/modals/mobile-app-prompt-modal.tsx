"use client";

import {
  Button,
  CFBase,
  Credenza,
  CredenzaBody,
  CredenzaClose,
  CredenzaContent,
  CredenzaFooter,
  CredenzaHeader,
  CredenzaTitle,
} from "@cf/ui";
import { X } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

import motifContainer from "@/assets/images/motif.png";
import { useModal } from "@/lib/stores/use-modal";

export default function MobileAppPromptModal() {
  const { isOpen, onClose, type } = useModal();
  const t = useTranslations("MobileAppPrompt");

  const isModalOpen = isOpen && type === "MobileAppPrompt";

  if (!isModalOpen) return null;

  const handleDownloadApp = () => {
    // TODO: Add logic to redirect to app store based on platform
    window.open(
      "https://play.google.com/store/apps/details?id=com.completefarmer.growermobile",
      "_blank",
    );
  };

  const handleContinue = () => {
    // TODO: Add logic to deep link to mobile app if installed
    window.location.href = "complete-farmer-mobile-app://farm-mapping";
  };

  return (
    <Credenza open={isModalOpen} onOpenChange={onClose}>
      <CredenzaContent className="max-h-[90vh] max-w-xl gap-0 space-y-0 overflow-hidden border-none bg-[#004C46] p-0">
        <CredenzaTitle className="sr-only">App Prompt</CredenzaTitle>
        {/* Decorative Background with Pattern */}
        <CredenzaHeader className="relative h-[350px] overflow-hidden md:h-[320px]">
          <Image
            src={motifContainer}
            fill
            alt="Decorative motif pattern"
            className="object-cover"
            priority
          />

          {/* Navigation - Close */}
          <CredenzaClose className="bg-primary-light absolute right-4 top-4 z-10 flex size-8 items-center justify-center rounded-full">
            <X className="text-foreground size-4" />
          </CredenzaClose>

          {/* App Icon */}
          <div className="absolute left-1/2 top-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-3">
            <div className="flex size-[100px] items-center justify-center rounded-[22px] bg-white shadow-lg">
              <CFBase className="flex size-14 items-center justify-center rounded-2xl bg-white" />
            </div>

            <p className="text-center text-lg font-medium text-white">
              {t("appName")}
            </p>
          </div>
        </CredenzaHeader>

        {/* Content */}
        <CredenzaBody className="z-50 border-none bg-white px-6 pb-0 pt-4 md:px-8">
          <div className="space-y-4 sm:rounded-lg">
            <p className="text-center text-2xl font-semibold text-gray-900 md:text-xl">
              {t("title")}
            </p>
            <p className="text-center text-base leading-6 text-gray-600">
              {t("description")}
            </p>
          </div>
        </CredenzaBody>

        {/* Footer */}
        <CredenzaFooter className="z-50 border-none bg-white">
          <div className="flex w-full flex-col gap-4 px-6 pb-8 pt-4 md:px-8">
            <Button
              onClick={handleDownloadApp}
              className="bg-primary h-14 w-full rounded-xl text-base font-semibold text-white hover:bg-green-600"
            >
              {t("downloadApp")}
            </Button>
            <div className="flex items-center justify-center gap-2">
              <span className="text-base text-gray-900">
                {t("alreadyHaveApp")}
              </span>
              <Button
                variant="link"
                onClick={handleContinue}
                className="h-auto p-0 text-base font-semibold text-green-500 hover:text-green-600"
              >
                {t("continue")}
              </Button>
            </div>
          </div>
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  );
}
