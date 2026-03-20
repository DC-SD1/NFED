"use client";

import { cn } from "@cf/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { farmingGoalSchema } from "@/lib/schemas/sign-up";
import { useSignUpStore } from "@/lib/stores/sign-up-store";

export function ExperiencedGoalsForm() {
  const t = useTranslations("onboarding.newbie.goals");
  const router = useRouter();
  const { setExperiencedData, experiencedData } = useSignUpStore();

  type GoalsData = z.infer<typeof farmingGoalSchema>;
  const goalValues = farmingGoalSchema.shape.farmingGoal.options;
  type GoalValue = (typeof goalValues)[number];

  const {
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<GoalsData>({
    resolver: zodResolver(farmingGoalSchema),
    defaultValues: {
      farmingGoal: experiencedData?.farmingGoal ?? undefined,
    },
  });

  const selectedGoal = watch("farmingGoal");

  const onSubmit = async (data: GoalsData) => {
    setExperiencedData({ farmingGoal: data.farmingGoal });
    router.push("/onboarding/experienced/commitment");
  };

  const toggleGoal = (value: GoalValue) => {
    setValue("farmingGoal", value);
    setTimeout(() => {
      void handleSubmit(onSubmit)();
    }, 10);
  };

  const goalOptions = goalValues.map((value) => ({
    value,
    label: t(`options.${value}`),
  }));

  return (
    <form className="space-y-6">
      <div className="space-y-3">
        <p className="text-16 leading-24 my-8 font-semibold">
          {t("mainQuestion")}
        </p>

        {goalOptions.map((option) => {
          const selected = selectedGoal === option.value;

          return (
            <div
              key={option.value}
              role="button"
              tabIndex={0}
              onClick={() => toggleGoal(option.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  toggleGoal(option.value);
                }
              }}
              className={cn(
                "relative flex w-full cursor-pointer items-start gap-1 rounded-xl border p-4 text-left",
                selected
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
                  selected
                    ? "bg-primary border-primary text-white"
                    : "border-gray-300",
                )}
              >
                {selected && <Check size={12} />}
              </div>
            </div>
          );
        })}
      </div>

      {errors.farmingGoal && (
        <p className="text-sm text-red-500"> {errors.farmingGoal.message} </p>
      )}
    </form>
  );
}
