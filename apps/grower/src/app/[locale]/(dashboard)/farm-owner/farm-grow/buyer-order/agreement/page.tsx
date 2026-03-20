"use client";

import { Button } from "@cf/ui";
import { ChevronRight, Help } from "@cf/ui/icons";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

import FarmingAgreementCard from "@/components/dashboard/order-details-cards/farm-agreement-card";
import TopLeftHeaderLayout from "@/components/dashboard/top-left-header";

export default function Page() {
  const t = useTranslations("dashboard.grow.contract");
  const router = useRouter();
  const [isAgreed, setIsAgreed] = useState(false);

  return (
    <TopLeftHeaderLayout>
      <div className="px-2 py-6 md:items-center md:justify-center md:px-6 md:pt-0 lg:px-8">
        <div className="mx-auto w-full max-w-lg md:max-w-4xl lg:max-w-2xl">
          <h1 className="mb-4 text-start text-2xl font-semibold tracking-tight sm:text-3xl  md:text-center ">
            {t("title")}
          </h1>

          <FarmingAgreementCard
            isAgreed={isAgreed}
            onAgreementChange={() => setIsAgreed((prev) => !prev)}
            nextPageUrl="/farm-owner/farm-grow/buyer-order/sign"
          />

          <div className="mt-8 flex items-center justify-center">
            <Button
              variant="default"
              className="w-full  rounded-xl sm:w-3/4"
              disabled={!isAgreed}
              onClick={() =>
                router.push("/farm-owner/farm-grow/buyer-order/sign")
              }
            >
              {t("sign")}
              <ChevronRight className="ml-2" />
            </Button>
          </div>
          <div className="bg-blue-light mx-auto mt-4 flex max-w-2xl items-center justify-center gap-3 rounded-lg p-2 sm:mt-8">
            <div className="bg-blue-light flex size-8 shrink-0 items-center justify-center rounded-full">
              <Help className="text-blue-dark" />
            </div>
            <p className="text-blue-dark text-xs font-thin">
              {t("description")}
            </p>
          </div>
        </div>
      </div>
    </TopLeftHeaderLayout>
  );
}
