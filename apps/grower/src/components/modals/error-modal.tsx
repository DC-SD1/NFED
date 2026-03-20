"use client";

import { DialogTitle } from "@cf/ui";
import { Button } from "@cf/ui/components/button";
import { Dialog, DialogContent } from "@cf/ui/components/dialog";

import ErrorIcon from "@/components/icons/error-icon";
import { useModal } from "@/lib/stores/use-modal";

export default function ErrorModal() {
  const { isOpen, onClose, type, data } = useModal();

  const isModalOpen = isOpen && type === "Error";

  if (!isModalOpen) return null;

  const {
    errorTitle,
    errorSubtitle,
    errorDescription,
    primaryButton,
    secondaryButton,
  } = data;

  const handlePrimaryClick = () => {
    primaryButton?.onClick?.();
    onClose();
  };

  const handleSecondaryClick = () => {
    onClose();
    secondaryButton?.onClick?.();
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose} modal>
      <DialogTitle className="sr-only">Error</DialogTitle>
      <DialogContent className="mx-auto w-[calc(100%-1rem)] rounded-2xl p-0 sm:max-w-md md:max-w-lg lg:max-w-xl">
        <div className="flex flex-col items-center px-8 pb-6 pt-8">
          {/* Error Icon */}
          <ErrorIcon className="mb-8 size-20 shrink-0" />

          {/* Text Container */}
          <div className="flex w-full flex-col gap-3 text-center">
            {errorTitle && (
              <h2 className="text-xl font-semibold leading-7 text-destructive">
                {errorTitle}
              </h2>
            )}
            {(errorSubtitle || errorDescription) && (
              <div className="text-base leading-6 text-foreground">
                {errorSubtitle && (
                  <div className="mb-0 text-base leading-6">
                    {errorSubtitle}
                  </div>
                )}
                {errorSubtitle && errorDescription && (
                  <p className="mb-0">&nbsp;</p>
                )}
                {errorDescription && <p>{errorDescription}</p>}
              </div>
            )}
          </div>

          {/* Actions */}
          {(primaryButton || secondaryButton) && (
            <div className="mt-8 flex w-full flex-col gap-2">
              {primaryButton && (
                <Button
                  variant={primaryButton.variant || "default"}
                  onClick={handlePrimaryClick}
                  className="w-full rounded-2xl py-4"
                >
                  {primaryButton.label}
                </Button>
              )}
              {secondaryButton && (
                <Button
                  variant={secondaryButton.variant || "link"}
                  onClick={handleSecondaryClick}
                  className="w-full py-4"
                >
                  {secondaryButton.label}
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
