"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { PreferenceOption } from "@/components/onboarding/preference-option";
import { useSignUpStore } from "@/lib/stores/sign-up-store";

export function FarmingPreferenceForm() {
  const t = useTranslations("onboarding.experienced.preference");
  const router = useRouter();

  const { setExperiencedData, experiencedData } = useSignUpStore();

  const [selected, setSelected] = useState<
    "farmOnMyOwn" | "farmWithManager" | null
  >(experiencedData.farmingPreferenceOne ?? null);

  const onSubmit = async (value: "farmOnMyOwn" | "farmWithManager") => {
    setSelected(value);
    // TODO: Save to user profile
    setExperiencedData({ farmingPreferenceOne: value });
    // Navigate to next step
    router.push("/onboarding/experienced/land-availability");
  };

  return (
    <div className="space-y-6">
      <p className="text-16 leading-24 my-8 font-semibold">{t("question")}</p>

      <div className="space-y-3">
        <PreferenceOption
          label={t("farmSelf")}
          value="farmOnMyOwn"
          selected={selected === "farmOnMyOwn"}
          onSelect={onSubmit}
        />
        <PreferenceOption
          label={t("farmManager")}
          value="farmWithManager"
          selected={selected === "farmWithManager"}
          onSelect={onSubmit}
        />
      </div>
    </div>
  );
}
