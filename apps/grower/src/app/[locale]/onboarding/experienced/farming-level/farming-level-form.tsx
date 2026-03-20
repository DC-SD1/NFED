"use client";

import { cn } from "@cf/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { farmingLevelSchema } from "@/lib/schemas/sign-up";
import { useSignUpStore } from "@/lib/stores/sign-up-store";

type FarmDetailsData = z.infer<typeof farmingLevelSchema>;

export function FarmDetailsForm() {
  const t = useTranslations("onboarding.experienced.farming-level");
  const router = useRouter();
  const { setExperiencedData, experiencedData } = useSignUpStore();

  const { handleSubmit, watch, setValue } = useForm<FarmDetailsData>({
    resolver: zodResolver(farmingLevelSchema),
    defaultValues: {
      farmingLevel: experiencedData.farmingLevel ?? undefined,
    },
  });

  const selected = watch("farmingLevel");

  const onSubmit = async (data: FarmDetailsData) => {
    setExperiencedData({ farmingLevel: data.farmingLevel });
    router.push("/onboarding/experienced/current-crops");
  };

  const options: { value: FarmDetailsData["farmingLevel"]; label: string }[] = [
    { value: "lessThanOneYear", label: t("options.less_than_1_year") },
    { value: "oneToThreeYears", label: t("options.1-3_years") },
    { value: "fourToSevenYears", label: t("options.4-7_years") },
    { value: "moreThanEightYears", label: t("options.8+_years") },
  ];

  const handleSelect = (value: FarmDetailsData["farmingLevel"]) => {
    setValue("farmingLevel", value);
    setTimeout(() => {
      void handleSubmit(onSubmit)();
    }, 10);
  };

  return (
    <form className="space-y-6">
      <div className="space-y-6">
        <p className="text-14 leading-20 mt-4 font-semibold">{t("question")}</p>

        {options.map((option) => (
          <div
            key={option.value}
            role="button"
            tabIndex={0}
            onClick={() => handleSelect(option.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                handleSelect(option.value);
              }
            }}
            className={cn(
              "relative flex w-full cursor-pointer items-start gap-1 rounded-xl border p-4 text-left",
              selected === option.value
                ? "bg-primary/5 border-primary"
                : "border-muted-foreground/20 bg-card",
            )}
          >
            <div className="flex-1 pl-8">
              <p className="text-sm font-medium">{option.label}</p>
            </div>

            <div
              className={cn(
                "absolute left-4 top-4 flex size-5 items-center justify-center rounded-full border",
                selected === option.value
                  ? "bg-primary border-primary text-white"
                  : "border-gray-300",
              )}
            >
              {selected === option.value && <Check size={12} />}
            </div>
          </div>
        ))}
      </div>
    </form>
  );
}
