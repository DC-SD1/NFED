"use client";

import { Button, Input } from "@cf/ui";
import { IconMinus, IconPlant2, IconPlus } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import type { UseFormRegister } from "react-hook-form";
import { useFormContext } from "react-hook-form";

import { useSourcingStore } from "@/lib/stores/sourcing-store";

export function QuantitySelector({
  register,
}: {
  register: UseFormRegister<any>;
}) {
  const t = useTranslations("sourcing.cropSpecification.quantitySelector");
  const { setValue, watch } = useFormContext();
  const currentQuantity = watch("quantity") || 0;
  const { availableQuantity } = useSourcingStore();

  const handleDecrease = () => {
    const newValue = Math.max(0, currentQuantity - 1000);
    setValue("quantity", newValue);
  };

  const handleIncrease = () => {
    const newValue = Math.min(availableQuantity, currentQuantity + 1000);
    setValue("quantity", newValue);
  };

  return (
    <div className="mt-8 space-y-2">
      <div className="flex items-center justify-between">
        <p className="font-bold">{t("title")}</p>

        <div className="flex h-[28px] w-[161px] items-center justify-center rounded-xl bg-[#F5F5F5]">
          <IconPlant2 className="!size-4" />
          <p className="text-sm">{t("available")}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Input
          placeholder={t("placeholder")}
          className="h-[64px] w-[148px] rounded-none border-x-0 border-b border-t-0 border-[hsl(var(--border-light))] text-[36px] font-bold text-[#161D1D] outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
          {...register("quantity", { valueAsNumber: true })}
        />

        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={handleDecrease}
            disabled={currentQuantity === 0}
            className="h-[48px] w-[48px] rounded-full bg-[#F5F5F5] text-[hsl(var(--text-dark))] hover:bg-[#F5F5F5] hover:text-[hsl(var(--text-dark))] disabled:opacity-50"
          >
            <IconMinus className="!size-5" />
          </Button>

          <Button
            type="button"
            onClick={handleIncrease}
            disabled={currentQuantity >= availableQuantity}
            className="h-[48px] w-[48px] rounded-full"
          >
            <IconPlus className="!size-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
