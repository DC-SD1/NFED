"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";

import confusedIcon from "@/assets/images/confused.png";
import greenHouseIcon from "@/assets/images/green-house.png";
import openFieldIcon from "@/assets/images/open-field.png";
import { FarmingCard } from "@/components/onboarding/farming-card";
import { useSignUpStore } from "@/lib/stores/sign-up-store";

const methodSchema = z.object({
  method: z.enum(["greenhouse", "openfield", "notSure"]),
});

type MethodData = z.infer<typeof methodSchema>;

export function FarmingMethodsForm() {
  const router = useRouter();
  const t = useTranslations("onboarding.experienced.farming-method");
  const { setExperiencedData, experiencedData } = useSignUpStore();
  const {
    setValue,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<MethodData>({
    resolver: zodResolver(methodSchema),
    defaultValues: {
      method: experiencedData.farmingMethod ?? undefined,
    },
  });

  const selectedMethod = watch("method");

  const submitMethod = (method: MethodData["method"]) => {
    setValue("method", method);
    setExperiencedData({ farmingMethod: method });
    void handleSubmit(async () => {
      router.push("/onboarding/experienced/goals");
    })();
  };

  return (
    <form className="space-y-6">
      <p className="text-16 leading-24 my-8 font-semibold">{t("question")}</p>

      <div className="grid grid-cols-1 gap-4">
        <FarmingCard
          icon={greenHouseIcon}
          label={t("greenhouse")}
          value="greenhouse"
          selected={selectedMethod === "greenhouse"}
          onClick={() => submitMethod("greenhouse")}
          isComingSoon={true}
        />
        <FarmingCard
          icon={openFieldIcon}
          label={t("openField")}
          value="open-field"
          selected={selectedMethod === "openfield"}
          onClick={() => submitMethod("openfield")}
        />
        <FarmingCard
          icon={confusedIcon}
          label={t("notSure")}
          value="not-sure"
          selected={selectedMethod === "notSure"}
          onClick={() => submitMethod("notSure")}
        />
      </div>

      {errors.method && (
        <p className="text-sm text-red-500">{errors.method.message}</p>
      )}
    </form>
  );
}
