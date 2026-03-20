"use client";

import { cn, Progress } from "@cf/ui";
import {
  Description,
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
  TransitionChild,
} from "@headlessui/react";
import { X } from "lucide-react";
import React from "react";

type DialogSize =
  | "xsmall"
  | "small"
  | "medium"
  | "large"
  | "xlarge"
  | "2xlarge"
  | "3xlarge";

const dialogWidth = (size: DialogSize) => {
  switch (size) {
    case "large": {
      return "lg:max-w-[44.5%]";
    }
    case "xsmall": {
      return "lg:max-w-[18%]";
    }
    case "small": {
      return "lg:max-w-[28.5%]";
    }
    case "medium": {
      return "lg:max-w-[34.5%]";
    }
    case "xlarge": {
      return "lg:max-w-[50%]";
    }
    case "2xlarge": {
      return "lg:max-w-[65%]";
    }
    case "3xlarge": {
      return "lg:max-w-[80%]";
    }
    default: {
      return "max-w-[40%]";
    } // Example default width
  }
};

interface Props {
  isOpen: boolean;
  size?: DialogSize;
  title: string;
  description?: string;
  content: React.ReactNode;
  footer: React.ReactNode;
  hideHeaderSeperator?: boolean;
  contentClassName?: string;
  panelClassName?: string;
  closeOnBackground?: boolean;
  onOpenChange?: (open: boolean) => void;
  progressValue?: number;
}

export default function AppDialog({
  isOpen,
  onOpenChange,
  size = "medium",
  title,
  description,
  content,
  footer,
  hideHeaderSeperator,
  contentClassName,
  panelClassName,
  closeOnBackground = true,
  progressValue,
}: Props) {
  const handleBackgroundCloseModal = () => {
    if (!closeOnBackground) return;
    onOpenChange?.(false);
  };

  const handleCloseModal = () => {
    onOpenChange?.(false);
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleBackgroundCloseModal}
      className="relative z-50"
    >
      <DialogBackdrop className="fixed inset-0 bg-[#171F1766] backdrop-blur-sm" />
      <div className="fixed inset-0 flex w-screen items-center justify-center">
        <TransitionChild
          enter="ease-out duration-300"
          enterFrom="opacity-0 transform-[scale(95%)]"
          enterTo="opacity-100 transform-[scale(100%)]"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 transform-[scale(100%)]"
          leaveTo="opacity-0 transform-[scale(95%)]"
        >
          <DialogPanel
            className={cn(
              "flex w-screen flex-col border bg-white md:max-h-[90vh] md:rounded-lg",
              dialogWidth(size),
              panelClassName,
            )}
          >
            <div className="md:rounded-t-lg">
              <div className="p-4">
                <DialogTitle className="flex items-center justify-between">
                  <button onClick={handleCloseModal} className="cursor-pointer">
                    <X className={"size-5"} />
                  </button>
                  <div>
                    <p className="text-xl font-bold">{title}</p>
                  </div>
                  <div></div>
                </DialogTitle>
                <Description
                  className={"max-w-[600px] text-xs text-secondary-foreground"}
                >
                  {description}
                </Description>
              </div>
              {hideHeaderSeperator ? null : <hr className="!mb-0 !bg-border" />}
              {progressValue && (
                <Progress
                  className={"h-2 rounded-none"}
                  value={progressValue}
                />
              )}
            </div>
            <div
              className={cn("mt-4 grow overflow-y-auto py-6", contentClassName)}
            >
              {content}
            </div>
            {footer && (
              <div className="border-t p-4 md:rounded-b-lg">{footer}</div>
            )}
          </DialogPanel>
        </TransitionChild>
      </div>
    </Dialog>
  );
}
