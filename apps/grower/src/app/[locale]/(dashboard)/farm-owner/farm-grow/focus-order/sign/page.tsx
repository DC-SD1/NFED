"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import TopLeftHeaderLayout from "@/components/dashboard/top-left-header";
import SignatureForm from "@/components/forms/signature-form";

export default function Page() {
  const t = useTranslations("dashboard.grow.signing");

  const searchParams = useSearchParams();
  const contractId = searchParams.get("contractId") || undefined;

  return (
    <TopLeftHeaderLayout>
      <div className="px-2 py-6 md:items-center md:justify-center md:px-6 md:pt-0 lg:px-8">
        <div className="mx-auto w-full max-w-lg md:max-w-4xl lg:max-w-2xl">
          <h1 className="mb-4 text-start text-2xl font-semibold tracking-tight sm:text-3xl md:text-center">
            {t("title")}
          </h1>

          <SignatureForm contractId={contractId} />
        </div>
      </div>
    </TopLeftHeaderLayout>
  );
}
