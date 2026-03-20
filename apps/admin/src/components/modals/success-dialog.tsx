"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@cf/ui";
import Image from "next/image";
import React from "react";

import PrimaryButton from "@/components/buttons/primary-button";
import { useModal } from "@/lib/stores/use-modal";
import { ImageAssets } from "@/utils/image-assets";

const SuccessDialog = () => {
  const { isOpen, type, data } = useModal();
  const isModalOpen = isOpen && type === "Success";
  if (!isModalOpen) return null;

  const { title, message, primaryButton } = data;
  return (
    <AlertDialog open={isModalOpen}>
      <AlertDialogContent
        overlayClassName={"bg-[#171F1766]"}
        className={"max-w-md rounded-t-2xl p-8 sm:rounded-2xl"}
      >
        <AlertDialogHeader className="p-0">
          <div className={"mb-8 flex items-center justify-center"}>
            <Image
              src={ImageAssets.CHECK}
              width={120}
              height={120}
              alt={"Success"}
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
            className="w-full font-semibold text-white transition-colors"
            buttonContent={primaryButton?.label}
            onClick={() => {
              primaryButton?.onClick();
            }}
          />
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SuccessDialog;
