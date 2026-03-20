"use client";

import { Button } from "@cf/ui/components/button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import primaryLogo from "@/assets/images/header-logo-primary.png";

export default function OopsPage() {
  const router = useRouter();
  const t = useTranslations("common.errors");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-center">
      <Image src={primaryLogo} alt="Logo" className="mb-8" />
      <h1 className="text-6xl font-bold">{t("oops_title")}</h1>
      <p className="mt-4 text-lg">{t("oops_message")}</p>
      <Button
        className="bg-primary mt-8 rounded-md px-8 py-3 font-bold text-white"
        onClick={() => router.push("/")}
      >
        {t("unauthorized.goToHome")}
      </Button>
    </div>
  );
}
