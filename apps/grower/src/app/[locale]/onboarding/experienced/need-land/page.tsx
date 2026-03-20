"use client";

import { Button } from "@cf/ui/components/button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { use } from "react";

import handShake from "@/assets/images/hand-shake.svg";
import { ProgressIndicator } from "@/components/auth/progress-indicator";
import { Logo } from "@/components/logo";

export default function NeedLandPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const router = useRouter();
  const { locale: _ } = use(params);
  const t = useTranslations("onboarding.newbie");

  return (
    <div className="space-y-0 lg:space-y-6">
      <ProgressIndicator currentStep={7} totalSteps={10} />
      <div className="block lg:hidden">
        <Logo />
      </div>
      <h1 className="text-2xl font-bold tracking-tight">
        {t("preference.title")}
      </h1>
      <div className="mt-9 flex items-center justify-center">
        <Image src={handShake} alt="handshake" className="size-20" />
      </div>
      <p className="text-md mt-3">
        {t("need-land.subtitle1")}
        <br />
        {t("need-land.subtitle2")}
      </p>
      <div className="space-y-30 mt-40">
        <Button
          className="w-full"
          type="button"
          onClick={() => router.push("/onboarding/experienced/farming-methods")}
        >
          {t("need-land.next")}
        </Button>
      </div>
    </div>
  );
}
