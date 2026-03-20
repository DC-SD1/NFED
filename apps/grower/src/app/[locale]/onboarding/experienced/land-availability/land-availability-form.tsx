"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { PreferenceOption } from "@/components/onboarding/preference-option";
import { useSignUpStore } from "@/lib/stores/sign-up-store";

const landAvailabilitySchema = z.object({
  answer: z.enum(["yes", "no"]),
});

type LandAvailabilityData = z.infer<typeof landAvailabilitySchema>;

export function LandAvailabilityForm() {
  const router = useRouter();
  const t = useTranslations("onboarding.experienced.land-availability");
  const { setExperiencedData, experiencedData } = useSignUpStore();
  const { watch, setValue } = useForm<LandAvailabilityData>({
    resolver: zodResolver(landAvailabilitySchema),
    defaultValues: {
      answer: experiencedData?.farmingPreferenceTwo ?? undefined,
    },
  });

  const selectedAnswer = watch("answer");
  const [hasSelected, setHasSelected] = useState(false);
  const didRedirect = useRef(false);

  useEffect(() => {
    if (!hasSelected || !selectedAnswer || didRedirect.current) return;

    setExperiencedData({ farmingPreferenceTwo: selectedAnswer });

    didRedirect.current = true;

    if (selectedAnswer === "yes") {
      router.push("/onboarding/experienced/farming-methods");
    } else {
      router.push("/onboarding/experienced/need-land");
    }
  }, [selectedAnswer, hasSelected, router, setExperiencedData]);

  return (
    <form className="space-y-6">
      <div className="space-y-3">
        <p className="text-16 leading-24 my-8 font-semibold">{t("question")}</p>

        <PreferenceOption
          label={t("yes")}
          value="yes"
          selected={selectedAnswer === "yes"}
          onSelect={(value) => {
            setValue("answer", value);
            setHasSelected(true);
          }}
        />

        <PreferenceOption
          label={t("no")}
          value="no"
          selected={selectedAnswer === "no"}
          onSelect={(value) => {
            setValue("answer", value);
            setHasSelected(true);
          }}
        />
      </div>
    </form>
  );
}
