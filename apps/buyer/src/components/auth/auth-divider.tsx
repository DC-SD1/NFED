"use client";

import { useTranslations } from "next-intl";

export function AuthDivider() {
  const t = useTranslations("auth");

  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-200" />
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="bg-white px-4 uppercase text-gray-400">{t("or")}</span>
      </div>
    </div>
  );
}
