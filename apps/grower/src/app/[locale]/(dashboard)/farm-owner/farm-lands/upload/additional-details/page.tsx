"use client";

import { useTranslations } from "next-intl";

import TopLeftHeaderLayout from "@/components/dashboard/top-left-header";
import { AdditionalDetailsForm } from "@/components/forms/additional-details-form";

export default function AdditionalDetailsPage() {
  const t = useTranslations("FarmLands.additionalDetails");

  return (
    <TopLeftHeaderLayout>
      <div className="flex flex-col items-center px-1 py-6 md:p-4">
        {/* Main content container with responsive width */}
        <div className="w-full max-w-lg space-y-6 pt-2 sm:pb-16 md:max-w-6xl md:space-y-8 md:pb-20 lg:max-w-2xl">
          {/* Header with responsive text size */}
          <h1 className="text-left text-2xl font-semibold text-foreground md:text-4xl lg:text-center">
            {t("title")}
          </h1>

          {/* Form component */}
          <AdditionalDetailsForm />
        </div>
      </div>
    </TopLeftHeaderLayout>
  );
}
