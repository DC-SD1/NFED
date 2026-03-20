"use client";

import { Button } from "@cf/ui/components/button";
import {
  Credenza,
  CredenzaBody,
  CredenzaContent,
  CredenzaFooter,
  CredenzaTitle,
} from "@cf/ui/components/credenza";
import { CloudUpload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { useModal } from "@/lib/stores/use-modal";

export default function UploadCoordinatesModal() {
  const { isOpen, onClose, type } = useModal();
  const router = useRouter();
  const t = useTranslations("FarmLands");

  const isModalOpen = isOpen && type === "UploadCoordinates";

  if (!isModalOpen) return null;

  const handleExcelUpload = () => {
    onClose();
    router.push("/farm-owner/farm-lands/upload?type=csv");
  };

  const handleKmlUpload = () => {
    onClose();
    router.push("/farm-owner/farm-lands/upload?type=kml");
  };

  return (
    <Credenza open={isModalOpen} onOpenChange={onClose}>
      <CredenzaContent className="mx-auto w-[calc(100%-1rem)] !rounded-2xl p-0 sm:max-w-sm md:max-w-md">
        <CredenzaTitle className="sr-only">{t("uploadCoordinates.modal.title")}</CredenzaTitle>
        <CredenzaBody className="flex flex-col items-center gap-6 p-8">
          {/* Title */}
          <h2 className="text-foreground text-center text-xl font-semibold leading-7">
            {t("uploadCoordinates.modal.title")}
          </h2>

          {/* Subtitle */}
          <p className="text-gray-dark text-center text-base leading-6">
            {t("uploadCoordinates.modal.subtitle")}
          </p>
        </CredenzaBody>

        {/* Action Buttons */}
        <CredenzaFooter className="flex flex-col gap-4 p-6 pt-0 sm:flex-row">
          <Button
            variant="default"
            onClick={handleExcelUpload}
            className="w-full rounded-2xl p-4 sm:flex-1"
          >
            <span className="font-semibold">{t("uploadCoordinates.modal.uploadCsv")}</span>
            <CloudUpload className="ml-2 size-6" />
          </Button>

          <Button
            variant="secondary"
            onClick={handleKmlUpload}
            className="bg-gray-light text-primary-darkest hover:bg-gray-light/90 w-full rounded-2xl p-4 sm:flex-1"
          >
            <span className="font-semibold">{t("uploadCoordinates.modal.uploadKml")}</span>
            <CloudUpload className="ml-2 size-6" />
          </Button>
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  );
}
