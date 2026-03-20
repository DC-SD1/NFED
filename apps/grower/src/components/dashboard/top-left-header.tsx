"use client";

import { cn } from "@cf/ui";
import { Button } from "@cf/ui/components/button";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

interface Props {
  onBack?: () => void;
  buttonClassName?: string;
  children: ReactNode;
}

export default function TopLeftHeaderLayout({
  children,
  onBack,
  buttonClassName,
}: Props) {
  const router = useRouter();
  const t = useTranslations("common");

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col md:pt-0">
      <div className="flex flex-col items-start">
        <Button
          onClick={handleBack}
          variant="default"
          className={cn(
            "bg-transparent px-0 text-black hover:bg-transparent lg:px-4",
            buttonClassName,
          )}
        >
          <ChevronLeft className="text-primary size-5" />
          {t("back")}
        </Button>
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}
