"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("onboarding.newbie.land-availability");
  const signUpStore = useSignUpStore();

  const { handleSubmit, watch, setValue } = useForm<LandAvailabilityData>({
    resolver: zodResolver(landAvailabilitySchema),
    defaultValues: {
      answer:
        signUpStore.newbieData?.hasLand === undefined
          ? undefined
          : signUpStore.newbieData?.hasLand
            ? "yes"
            : "no",
    },
  });

  const selectedAnswer = watch("answer");

  const onSubmit = async (data: LandAvailabilityData) => {
    signUpStore.setNewbieData({ hasLand: data.answer === "yes" });
    if (data.answer === "yes") {
      router.push("/onboarding/newbie/farming-method");
    } else {
      router.push("/onboarding/newbie/need-land");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-3">
        <p className="text-16 leading-24 my-8 font-semibold">{t("question")}</p>

        <PreferenceOption
          label={t("yes")}
          value="yes"
          selected={selectedAnswer === "yes"}
          onSelect={(value) => {
            setValue("answer", value);
            void handleSubmit(onSubmit)();
          }}
        />

        <PreferenceOption
          label={t("no")}
          value="no"
          selected={selectedAnswer === "no"}
          onSelect={(value) => {
            setValue("answer", value);
            void handleSubmit(onSubmit)();
          }}
        />
      </div>
    </form>
  );
}
