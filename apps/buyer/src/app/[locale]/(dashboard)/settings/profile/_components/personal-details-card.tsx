"use client";

import { Button } from "@cf/ui";
import { IconEdit } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

export function PersonalDetailsCard() {
  const t = useTranslations("settings.profile.buttons");
  return (
    <div className="h-[312px] w-full space-y-8 rounded-2xl border-[hsl(var(--border-light))] bg-[hsl(var(--background-light))] p-4 md:h-[348px] md:p-6 lg:border lg:bg-transparent lg:p-4">
      <div className="flex items-center justify-between">
        <p className="text-base font-bold leading-[28px] md:text-[20px]">
          Personal details
        </p>

        <Button
          variant="unstyled"
          className="h-[36px] w-[75px] p-0 text-sm font-bold leading-none text-[hsl(var(--text-dark))]"
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

      <div>
        <ul className="space-y-6 text-xs md:text-sm">
          <li className="flex items-center justify-between">
            <p className="font-bold">Country</p>
            <p>Ghana</p>
          </li>
          <li className="flex items-center justify-between">
            <p className="font-bold">Organization role</p>
            <p>Not provided</p>
          </li>
          <li className="flex items-center justify-between">
            <p className="font-bold">Phone number</p>
            <p>Not provided</p>
          </li>
        </ul>
      </div>
    </div>
  );
}
