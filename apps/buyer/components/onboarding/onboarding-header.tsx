"use client";

import { Button } from "@cf/ui/components/button";
import { ChevronLeft } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { useSignUpStore } from "@/lib/stores/sign-up-store";

export function OnboardingHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const signUpStore = useSignUpStore();
  const t = useTranslations("common");

  if (
    /^\/[a-z]{2}\/onboarding\/(?:newbie|experienced)\/complete$/.test(pathname)
  )
    return null;
  const hideBackButton = /^\/[a-z]{2}\/onboarding\/marketing$/.test(pathname);

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.replace(`/${pathname.split("/")[1]}/dashboard`);
    }
  };

  const handleSkip = () => {
    if (signUpStore.experiencedData) {
      signUpStore.setExperiencedData({});
    } else {
      signUpStore.setNewbieData({});
    }
    router.replace(`/${pathname.split("/")[1]}/dashboard`);
  };

  return (
    <div className="relative z-20 flex w-full items-center justify-between bg-white px-4 pt-3">
      <div className="flex min-w-[100px] justify-start">
        {hideBackButton ? (
          <div className="invisible h-5 w-full" /> // placeholder to keep layout
        ) : (
          <Button
            onClick={handleBack}
            className="flex items-center gap-2 bg-transparent text-sm font-bold text-black hover:bg-transparent"
          >
            <ChevronLeft className="text-primary size-5" />
            {t("back")}
          </Button>
        )}
      </div>

      <div className="flex min-w-[100px] justify-end">
        <Button
          onClick={handleSkip}
          className="flex items-center gap-2 bg-transparent text-sm font-bold text-black hover:bg-transparent"
        >
          {t("skip")}
        </Button>
      </div>
    </div>
  );
}
