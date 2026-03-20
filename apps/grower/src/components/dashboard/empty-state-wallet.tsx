"use client";

import { Button, Card } from "@cf/ui";
import Image from "next/image";
import { useTranslations } from "next-intl";

import farmer from "@/assets/images/experienced-farmer.png";

const EmptyStateWallet = () => {
  const t = useTranslations("dashboard.wallet.emptyState");
  return (
    <Card className="flex h-full max-h-screen items-center justify-center rounded-2xl border-none p-6 sm:px-8 sm:py-16">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="mt-6 flex justify-center">
          <Image
            src={farmer}
            alt="Farm Lands"
            width={100}
            height={100}
            className="rounded-md object-contain"
          />
        </div>

        <div className="mt-6 space-y-4">
          <h1 className="text-2xl font-semibold">{t("subtitle")}</h1>
          <p className="text-sm leading-relaxed text-gray-dark">
            {t("noLinkedWalletDescription")}
          </p>
          <Button className="w-56">{t("linkPersonalWallet")} + </Button>
        </div>
      </div>
    </Card>
  );
};

export default EmptyStateWallet;
