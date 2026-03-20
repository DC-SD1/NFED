"use client";

import { Button } from "@cf/ui/components/button";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default function TopLeftHeaderLayout({ children }: Props) {
  const router = useRouter();
  const t = useTranslations("common");

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="relative h-full md:pt-0">
      <div className="flex flex-col items-start">
        <Button
          onClick={handleBack}
          variant="default"
          className="bg-transparent px-0 text-black hover:bg-transparent"
        >
          <ChevronLeft className="text-primary size-5" />
          {t("back")}
        </Button>
      </div>
      {children}
    </div>
  );
}
