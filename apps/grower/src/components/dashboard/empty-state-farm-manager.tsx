"use client";

import { Card } from "@cf/ui";
import Image from "next/image";
import { useTranslations } from "next-intl";

import farmLands from "@/assets/images/open-field.png";

const EmptyStateFarmManager = () => {
  const t = useTranslations("dashboard.farmManager.emptyState");
  return (
    <Card className="flex h-full max-h-screen items-center justify-center rounded-2xl border-none p-6 sm:px-8 sm:py-16">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="mt-6 flex justify-center">
          <Image
            src={farmLands}
            alt="Farm Lands"
            width={100}
            height={100}
            className="rounded-md object-contain"
          />
        </div>

        <div className="mt-6 space-y-4">
          <h1 className="text-2xl font-semibold">{t("noAssignedGrower")}</h1>
          <p className="text-gray-dark text-sm leading-relaxed">
            {t("noGrowerDescription")}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default EmptyStateFarmManager;
