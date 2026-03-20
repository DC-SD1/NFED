"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { PreferenceOption } from "@/components/onboarding/preference-option";
import { useSignUpStore } from "@/lib/stores/sign-up-store";

export function WelcomeContent() {
  const t = useTranslations("onboarding.newbie.preference");
  const router = useRouter();
  const signUpStore = useSignUpStore();
  const [selected, setSelected] = useState<"solo" | "manager" | null>(
    signUpStore.newbieData?.workPreference ?? null,
  );

  const handleSubmit = (value: "solo" | "manager") => {
    setSelected(value);
    signUpStore.setNewbieData({ workPreference: value });
    router.push("/onboarding/newbie/land-availability");
  };

  return (
    <div className="space-y-6">
      <p className="text-16 leading-24 my-8 font-semibold">{t("question")}</p>

      <div className="space-y-3">
        <PreferenceOption
          label={t("farmSelf")}
          value="solo"
          selected={selected === "solo"}
          onSelect={handleSubmit}
        />
        <PreferenceOption
          label={t("farmManager")}
          value="manager"
          selected={selected === "manager"}
          onSelect={handleSubmit}
        />
      </div>
    </div>
  );
}
