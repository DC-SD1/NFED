"use client";

import { Button } from "@cf/ui/components/button";
import { ControlledCheckbox } from "@cf/ui/components/controlled-checkbox";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useSignUpStore } from "@/lib/stores/sign-up-store";
import { logger } from "@/lib/utils/logger";

export function CurrentCropsForm() {
  const t = useTranslations("onboarding.experienced.current-crops");
  const router = useRouter();
  const { setExperiencedData, experiencedData } = useSignUpStore();

  const currentCropsSchema = z.object({
    crops: z.array(z.string()).min(1, t("errors.selectAtLeastOne")),
  });

  type CurrentCropsData = z.infer<typeof currentCropsSchema>;

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CurrentCropsData>({
    resolver: zodResolver(currentCropsSchema),
    defaultValues: {
      crops: experiencedData.cropsCultivated ?? [],
    },
  });

  const selectedCrops = watch("crops");

  const onSubmit = async (data: CurrentCropsData) => {
    logger.info("Selected crops:", data);
    setExperiencedData({ cropsCultivated: data.crops });
    router.push("/onboarding/experienced/farming-preference");
  };

  const crops = [
    { value: "chilli-pepper", label: t("options.chilli-pepper") },
    { value: "maize", label: t("options.maize") },
    { value: "soybean", label: t("options.soybean") },
    { value: "sweet-potatoes", label: t("options.sweet-potatoes") },
    { value: "other", label: t("options.other") },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <p className="text-muted-foreground text-sm">{t("instruction")}</p>
      <div className="max-h-[40vh] w-full space-y-6 overflow-y-auto lg:max-h-[50vh]">
        {crops.map((crop) => (
          <ControlledCheckbox
            key={crop.value}
            control={control}
            name="crops"
            value={crop.value}
            label={crop.label}
          />
        ))}
      </div>

      {errors.crops?.message && (
        <p className="text-sm text-red-500">{errors.crops.message}</p>
      )}

      <div className="space-y-30 mt-40">
        <Button
          className="w-full"
          type="button"
          disabled={selectedCrops.length === 0}
          onClick={handleSubmit(onSubmit)}
        >
          {t("next")}
          <ChevronRight className="ml-2 size-4" />
        </Button>
      </div>
    </form>
  );
}
