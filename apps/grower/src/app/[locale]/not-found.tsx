"use client";

import { Button } from "@cf/ui/components/button";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { use } from "react";

export default function NotFound({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  const t = useTranslations("common");

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="mx-auto max-w-md space-y-6">
        <div className="text-6xl">🔍</div>

        <h1 className="text-destructive text-3xl font-bold">
          {t("errors.notFound.title")}
        </h1>

        <p className="text-muted-foreground">{t("errors.notFound.message")}</p>

        <div className="space-y-4">
          <Button asChild>
            <Link href={`/${locale}`}>{t("errors.notFound.goToHome")}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
