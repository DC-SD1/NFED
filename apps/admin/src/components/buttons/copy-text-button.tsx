"use client";

import { cn } from "@cf/ui";
import { Check, Copy } from "lucide-react";
import { useTranslations } from "next-intl";
import React, { useState } from "react";

import { logger } from "@/lib/utils/logger";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toast";

interface CopyTextButtonProps {
  textToCopy: string;
  className?: string;
  iconClassName?: string;
}

const CopyTextButton: React.FC<CopyTextButtonProps> = ({
  textToCopy,
  className,
  iconClassName,
}) => {
  const t = useTranslations("common.copyButton");
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      try {
        await navigator.clipboard.writeText(textToCopy);
        setIsCopied(true);
        showSuccessToast(t("success"));
      } catch {
        showErrorToast(t("error"));
      }

      // Reset the icon back to copy after 2 seconds
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch {
      logger.error(`Error copying to clipboard`);
    }
  };

  return (
    <button
      type={"button"}
      onClick={handleCopyClick}
      className={`text-[#1A5514] transition-all duration-300 ${className}`}
    >
      {isCopied ? (
        <Check className={cn("size-5", iconClassName)} />
      ) : (
        <Copy className={cn("size-5", iconClassName)} />
      )}
    </button>
  );
};

export default CopyTextButton;
