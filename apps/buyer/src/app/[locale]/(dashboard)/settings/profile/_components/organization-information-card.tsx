"use client";

import { Button } from "@cf/ui";
import { IconEdit } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

export function OrganizationInformationCard() {
  const t = useTranslations("settings.profile.buttons");
  return (
    <div className="h-[400px] w-full space-y-8 rounded-2xl border-[hsl(var(--border-light))] bg-[hsl(var(--background-light))] p-6 md:h-[428px] md:p-6 lg:h-[348px] lg:border lg:bg-transparent lg:p-4">
      <div className="flex items-center justify-between">
        <p className="text-base font-bold leading-[28px] md:text-[20px]">
          Organization information
        </p>

        <Button
          variant="unstyled"
          className="h-[36px] w-[75px] bg-white p-0 text-sm font-bold leading-none text-[hsl(var(--text-dark))] md:bg-transparent"
        >
          <IconEdit className="size-4" />
          {t("edit")}
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="size-[64px] rounded-full bg-[hsl(var(--avatar-background))] lg:size-[80px]"></div>
        <div className="space-y-1">
          <p>Austine Eluro</p>
          <p className="text-sm text-[#586665]">austine.eluro@example.com</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
        <dl className="flex flex-row items-center justify-between md:flex-col md:items-start md:justify-start">
          <dt className="text-xs font-bold text-[#586665] md:text-sm">
            Organization size
          </dt>
          <dd className="text-sm md:text-base">50 - 249 people</dd>
        </dl>
        <dl className="flex flex-row items-center justify-between md:flex-col md:items-start md:justify-start">
          <dt className="text-xs font-bold text-[#586665] md:text-sm">
            Revenue range
          </dt>
          <dd className="text-sm md:text-base">{">"} GHS 1,000,000</dd>
        </dl>
        <dl className="flex flex-row items-center justify-between md:flex-col md:items-start md:justify-start">
          <dt className="text-xs font-bold text-[#586665] md:text-sm">
            Industry
          </dt>
          <dd className="text-sm md:text-base">Not provided</dd>
        </dl>
        <dl className="flex flex-row items-center justify-between md:flex-col md:items-start md:justify-start">
          <dt className="text-xs font-bold text-[#586665] md:text-sm">
            Website
          </dt>
          <dd className="text-sm md:text-base">Not provided</dd>
        </dl>
        <dl className="flex flex-row items-center justify-between md:flex-col md:items-start md:justify-start">
          <dt className="text-xs font-bold text-[#586665] md:text-sm">
            Year established
          </dt>
          <dd className="text-sm md:text-base">Not provided</dd>
        </dl>
      </div>
    </div>
  );
}
