"use client";
import CustomSlider from "@cf/ui/components/slider";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import vegetables from "@/assets/images/vegetables.png";
import { useApiClient } from "@/lib/api";
import { useAuthUser } from "@/lib/stores/auth-store-ssr";
import type { ExperiencedData } from "@/lib/stores/sign-up-store";
import { useSignUpStore } from "@/lib/stores/sign-up-store";
import { useLocalizedErrorHandler } from "@/lib/utils/localized-error-handler";
import { logger } from "@/lib/utils/logger";

export function CommitmentExperiencedContent() {
  const router = useRouter();
  const { userId: authUserId } = useAuthUser();
  const t = useTranslations("onboarding.newbie.commitment");
  const e = useTranslations("auth.errors");
  const signUpStore = useSignUpStore();
  const api = useApiClient();
  const { handleError } = useLocalizedErrorHandler();

  const handleComplete = async () => {
    const profile = signUpStore.getCompleteUserProfile();

    try {
      if (!authUserId) throw new Error(e("auth_error"));

      const { error: startError } = await api.client.POST("/onboarding/start", {
        body: {
          userId: authUserId,
        },
      });

      if (startError) throw new Error(e("start_error"));

      const responses: Record<string, string | string[] | ExperiencedData> = {
        farmingExperience: "experienced",
        marketingChannels: profile.onboarding.marketingChannels ?? [],
        marketingChannelOther: profile.onboarding.marketingChannelOther ?? "",
        farmingLevel: profile.onboarding.farmingExperience ?? "",
        data: signUpStore.experiencedData,
      };

      const { error: submitError } = await api.client.PUT(
        "/onboarding/responses",
        {
          body: {
            userId: authUserId,
            responses: { ...responses },
          },
        },
      );

      if (submitError) throw new Error(e("submit_error"));

      router.push("/onboarding/experienced/complete");
    } catch (err) {
      logger.error("Onboarding failed", err);
      handleError(err);
    }
  };
  return (
    <div className="space-y-10">
      <div className="space-y-2 text-start">
        <p className="text-15 leading-24 my-8 font-semibold">{t("start")}</p>
      </div>

      <div className="flex items-center justify-center">
        <Image src={vegetables} alt="Vegetables" className="w-[100px]" />
      </div>

      <div className="flex flex-col items-center space-y-4">
        <CustomSlider
          defaultValue={[0]}
          max={100}
          step={1}
          width="w-[300px]"
          trackColor="bg-gray-300"
          rangeColor="bg-primary"
          thumbColor="bg-gray-500"
          thumbHoverColor="hover:bg-primary"
          ariaLabel="Farm gate slider"
          labelText={t("swipe")}
          onComplete={handleComplete}
        />
        <p className="text-center text-sm font-medium text-gray-700">
          {t("slide")}
        </p>
      </div>
    </div>
  );
}
