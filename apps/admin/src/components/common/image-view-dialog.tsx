"use client";

import Image from "next/image";
import React from "react";

import AppDialog from "@/components/modals/app-dialog";
import AppDialogContent from "@/components/modals/app-dialog-content";
import { useModal } from "@/lib/stores/use-modal";

const ImageViewDialog = () => {
  const { isOpen, type, data, onClose } = useModal();
  const isModalOpen = isOpen && type === "ImageView";
  const { title, fileUrl } = data;

  if (!isModalOpen) return null;

  return (
    <AppDialog
      key={"image-view"}
      isOpen={isOpen}
      size={"large"}
      title={title ?? ""}
      closeOnBackground={false}
      onOpenChange={(_) => {
        onClose();
      }}
      content={
        <>
          <AppDialogContent>
            <div className="w-full">
              <Image
                width={600}
                height={400}
                src={fileUrl ?? ""}
                alt={title ?? ""}
                className={"h-96 w-full object-cover"}
              />
            </div>
          </AppDialogContent>
        </>
      }
    />
  );
};

export default ImageViewDialog;
