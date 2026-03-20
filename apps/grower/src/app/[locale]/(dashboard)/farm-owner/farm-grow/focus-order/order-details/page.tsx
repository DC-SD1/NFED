"use client";

import { Button } from "@cf/ui";
import { ChevronRight } from "@cf/ui/icons";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import FocusAgriculturalOrderCard from "@/components/dashboard/order-details-cards/focus-order-summary-card";
import TopLeftHeaderLayout from "@/components/dashboard/top-left-header";

export default function Page() {
  const t = useTranslations("dashboard.grow.order-details");
  const router = useRouter();

  return (
    <TopLeftHeaderLayout>
      <div className="px-2 py-6 md:items-center md:justify-center md:px-6 md:pt-0 lg:px-8">
        <div className="mx-auto w-full max-w-lg md:max-w-4xl lg:max-w-2xl">
          <h1 className="mb-4 text-start text-2xl font-semibold tracking-tight sm:text-3xl md:text-center ">
            {t("title")}
          </h1>

          <FocusAgriculturalOrderCard />
          <div className="mt-8 flex items-center justify-center">
            <Button
              variant="default"
              className="w-3/4 rounded-xl"
              onClick={() =>
                router.push("/farm-owner/farm-grow/focus-order/agreement")
              }
            >
              {t("farm")}
              <ChevronRight className="ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </TopLeftHeaderLayout>
  );
}
