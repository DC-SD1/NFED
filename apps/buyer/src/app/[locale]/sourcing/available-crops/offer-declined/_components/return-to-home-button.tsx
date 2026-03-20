"use client";

import { useRouter } from "@bprogress/next/app";
import { Button } from "@cf/ui";
import { useTranslations } from "next-intl";
import React from "react";

export default function ReturnToHomeButton() {
  const t = useTranslations();
  const router = useRouter();

  return (
    <Button
      className="h-[48px] w-[400px] rounded-full bg-[#F5F5F5] font-bold text-[hsl(var(--text-dark))] hover:text-white"
      onClick={() => {
        router.push("/home");
      }}
    >
      {t("sourcing.orderDeclined.returnToHome")}
    </Button>
  );
}
