import { Clock } from "lucide-react";
import { useTranslations } from "next-intl";
import React from "react";

export const NotificationSettingComing = () => {
  const t = useTranslations("comingSoon.notifications");

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gray-100 p-6 shadow-xl">
      {/* Overlay Watermark */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <span className="rotate-[-30deg] select-none text-5xl font-extrabold opacity-30">
          {t("overlay")}
        </span>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="mb-6">
          <h3 className="mb-2 text-lg font-semibold text-black">
            {t("title")}
          </h3>
          <p className="text-gray-dark text-sm">{t("subtitle")}</p>
        </div>

        {/* Comments Section */}
        <div className="mb-6">
          <h4 className="mb-2 text-base font-semibold text-black">
            {t("comments.title")}
          </h4>
          <p className="text-gray-dark mb-4 text-sm">{t("comments.desc")}</p>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-dark text-sm">
                {t("channels.push")}
              </span>
              <div className="relative inline-block h-5 w-10">
                <div className="h-5 w-10 rounded-full bg-green-500 shadow-inner"></div>
                <div className="absolute right-0 top-0 size-5 rounded-full border-2 border-green-500 bg-white transition-transform"></div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-dark text-sm">
                {t("channels.email")}
              </span>
              <div className="relative inline-block h-5 w-10">
                <div className="h-5 w-10 rounded-full bg-gray-300 shadow-inner"></div>
                <div className="absolute left-0 top-0 size-5 rounded-full border-2 border-gray-300 bg-white transition-transform"></div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-dark text-sm">
                {t("channels.sms")}
              </span>
              <div className="relative inline-block h-5 w-10">
                <div className="h-5 w-10 rounded-full bg-gray-300 shadow-inner"></div>
                <div className="absolute left-0 top-0 size-5 rounded-full border-2 border-gray-300 bg-white transition-transform"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Tags Section */}
        <div className="mb-6">
          <h1 className="text-md mb-2 font-semibold text-black">
            {t("tags.title")}
          </h1>
          <p className="text-gray-dark mb-4 text-sm">{t("tags.desc")}</p>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-dark text-sm">
                {t("channels.push")}
              </span>
              <div className="relative inline-block h-5 w-10">
                <div className="h-5 w-10 rounded-full bg-green-500 shadow-inner"></div>
                <div className="absolute right-0 top-0 size-5 rounded-full border-2 border-green-500 bg-white transition-transform"></div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-dark text-sm">
                {t("channels.email")}
              </span>
              <div className="relative inline-block h-5 w-10">
                <div className="h-5 w-10 rounded-full bg-gray-300 shadow-inner"></div>
                <div className="absolute left-0 top-0 size-5 rounded-full border-2 border-gray-300 bg-white transition-transform"></div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-dark text-sm">
                {t("channels.sms")}
              </span>
              <div className="relative inline-block h-5 w-10">
                <div className="h-5 w-10 rounded-full bg-gray-300 shadow-inner"></div>
                <div className="absolute left-0 top-0 size-5 rounded-full border-2 border-gray-300 bg-white transition-transform"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Coming Soon Badge */}
        <div className="flex items-center justify-center py-4">
          <div className="flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-green-700">
            <Clock className="size-4" />
            <span className="text-sm font-medium">{t("comingSoon")}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
