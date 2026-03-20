"use client";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@cf/ui";
import Image from "next/image";
import React from "react";

import PrimaryButton from "@/components/buttons/primary-button";
import { ImageAssets } from "@/utils/image-assets";

interface Props {
  isOpen: boolean;
  title: string;
  message: string;
  confirmDialog: () => void;
  confirmText: string;
  closeDialog: () => void;
  cancelText: string;
  confirmButtonLoading?: boolean;
}

const DestructiveConfirmationDialog = ({
  isOpen,
  title,
  message,
  confirmDialog,
  closeDialog,
  confirmText,
  cancelText,
  confirmButtonLoading,
}: Props) => {
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent
        overlayClassName={"bg-[#171F1766]"}
        className={"max-w-md rounded-t-2xl p-8 sm:rounded-2xl"}
      >
        <AlertDialogHeader className="p-0">
          <div className={"mb-8 flex items-center justify-center"}>
            <Image
              src={ImageAssets.ERROR}
              width={120}
              height={120}
              alt={"Error"}
            />
          </div>

          <AlertDialogTitle className="mb-3 text-center text-xl font-semibold">
            {title}
          </AlertDialogTitle>

          <AlertDialogDescription className="text-secondary-foreground text-center text-sm leading-relaxed">
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-8 flex !flex-col gap-2">
          <PrimaryButton
            isLoading={confirmButtonLoading}
            className="w-full rounded-full bg-[#BA1A1A] font-semibold text-white transition-colors hover:bg-red-700"
            onClick={confirmDialog}
            buttonContent={confirmText}
          />

          <AlertDialogCancel
            tabIndex={-1}
            className="w-full rounded-full border-0 font-semibold text-[#36B92E] transition-colors hover:bg-white hover:text-[#36B92E]"
            onClick={closeDialog}
          >
            {cancelText}
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DestructiveConfirmationDialog;
