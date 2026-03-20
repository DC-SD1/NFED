"use client";

import { DialogTitle } from "@cf/ui";
import { Button } from "@cf/ui/components/button";
import { Dialog, DialogContent } from "@cf/ui/components/dialog";
import Image from "next/image";

import balloons from "@/assets/images/balloons.png";
import { useModal } from "@/lib/stores/use-modal";

export default function SuccessModal() {
  const { isOpen, onClose, type, data } = useModal();

  const isModalOpen = isOpen && type === "Success";

  if (!isModalOpen) return null;

  const { successTitle, successDescription, primaryButton } = data;

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose} modal>
      <DialogTitle className="sr-only">Success</DialogTitle>
      <DialogContent className="mx-auto w-[calc(100%-1rem)] rounded-3xl p-6 sm:max-w-sm md:max-w-md">
        <div className="flex flex-col items-center px-2 pb-10 pt-8">
          {/* Success Icon */}
          <Image
            src={balloons}
            alt="Success Icon"
            className="mb-8 size-32 shrink-0"
          />

          {/* Text Container */}
          <div className="flex w-full flex-col gap-3 text-center">
            {successTitle && (
              <h2 className="text-success text-xl font-semibold leading-7">
                {successTitle}
              </h2>
            )}
            {successDescription && (
              <p className="text-foreground text-base leading-6">
                {successDescription}
              </p>
            )}
          </div>

          {primaryButton && (
            <div className="mt-8 w-full">
              <Button
                onClick={primaryButton.onClick}
                variant={primaryButton.variant || "default"}
                className="w-full"
              >
                {primaryButton.label}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
