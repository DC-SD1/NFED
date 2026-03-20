"use client";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  cn,
} from "@cf/ui";
import React from "react";

import PrimaryButton from "@/components/buttons/primary-button";

interface Props {
  isOpen: boolean;
  title: string;
  message: string;
  confirmDialog: () => void;
  confirmText: string;
  closeDialog: () => void;
  cancelText: string;
  confirmButtonLoading?: boolean;
  dialogContentClassName?: string;
}

const ConfirmationDialog = ({
  isOpen,
  title,
  message,
  confirmDialog,
  closeDialog,
  confirmText,
  cancelText,
  confirmButtonLoading,
  dialogContentClassName,
}: Props) => {
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent
        overlayClassName={"bg-[#171F1766]"}
        className={cn(
          "max-w-md rounded-t-2xl p-8 sm:rounded-2xl",
          dialogContentClassName,
        )}
      >
        <AlertDialogHeader className="p-0">
          <AlertDialogTitle className="mb-3 text-center text-xl font-bold">
            {title}
          </AlertDialogTitle>

          <AlertDialogDescription className="text-secondary-foreground text-center text-sm leading-relaxed">
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-8 flex !flex-col gap-2">
          <PrimaryButton
            isLoading={confirmButtonLoading}
            className="w-full rounded-xl font-bold text-white transition-colors"
            onClick={confirmDialog}
            buttonContent={confirmText}
          />

          <AlertDialogCancel
            tabIndex={-1}
            className="text-primary hover:text-primary w-full rounded-full border-0 font-semibold transition-colors hover:bg-white"
            onClick={closeDialog}
          >
            {cancelText}
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmationDialog;
