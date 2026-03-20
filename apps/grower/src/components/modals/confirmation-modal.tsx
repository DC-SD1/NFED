"use client";

import { DialogTitle } from "@cf/ui";
import { Button } from "@cf/ui/components/button";
import { Dialog, DialogContent } from "@cf/ui/components/dialog";
import { Input } from "@cf/ui/components/input";
import { Label } from "@cf/ui/components/label";
import { useState } from "react";

import { useModal } from "@/lib/stores/use-modal";

export default function ConfirmationModal() {
  const { isOpen, onClose, type, data } = useModal();
  const isModalOpen = isOpen && type === "Confirmation";

  const {
    title,
    subtitle,
    inputLabel,
    inputPlaceholder,
    confirmText,
    cancelText,
    onConfirm,
    onCancel,
  } = data || {};

  const [inputValue, setInputValue] = useState("");

  if (!isModalOpen) return null;

  return (
    <div>
      <Dialog open={isModalOpen} onOpenChange={onClose} modal>
        <DialogTitle className="sr-only">Confirmation</DialogTitle>
        <DialogContent className="mx-auto  w-[calc(100%-1rem)]  !rounded-2xl p-6 md:max-w-md">
          <div className="flex flex-col gap-6">
            {/* Title & Subtitle */}
            <div className="flex flex-col gap-2 text-center">
              {title && <h2 className="text-md font-semibold">{title}</h2>}
              {subtitle && (
                <p className="text-muted-foreground text-sm leading-6">
                  {subtitle}
                </p>
              )}
            </div>

            {/* Input Field */}
            {inputLabel && (
              <div className="flex flex-col gap-2 text-left">
                <Label htmlFor="confirmation-input" className="text-sm">
                  {inputLabel}
                </Label>
                <Input
                  id="confirmation-input"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={inputPlaceholder || ""}
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col items-center gap-3 ">
              <Button
                onClick={() => {
                  if (!inputValue.trim()) return;
                  onConfirm?.(inputValue);
                  onClose();
                }}
                className="w-3/4"
                disabled={!inputValue.trim()}
              >
                {confirmText || "Confirm"}
              </Button>
              <Button
                variant="unstyled"
                onClick={() => {
                  onCancel?.();
                  onClose();
                }}
                className="w-3/4  "
              >
                {cancelText || "Cancel"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
