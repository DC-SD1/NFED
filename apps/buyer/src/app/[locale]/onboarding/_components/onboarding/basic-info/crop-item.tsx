"use client";

import { Checkbox, Label } from "@cf/ui";
import type { CheckedState } from "@radix-ui/react-checkbox";
import Image from "next/image";
import { useFormContext } from "react-hook-form";

interface CropItemProps {
  name: string;
  crop: {
    value: string;
    label: string;
    image: string;
    category: string;
  };
}

export function CropItem({ name, crop }: CropItemProps) {
  const { watch, setValue } = useFormContext();
  const selectedCrops = watch("crops") || [];

  const isChecked = selectedCrops.includes(crop.label);

  const handleCheckedChange = (checked: CheckedState) => {
    if (checked === true) {
      // Add crop to selected crops
      setValue("crops", [...selectedCrops, crop.label], {
        shouldValidate: true,
      });
    } else {
      // Remove crop from selected crops
      setValue(
        "crops",
        selectedCrops.filter((c: string) => c !== crop.label),
        { shouldValidate: true },
      );
    }
  };

  return (
    <Label className="flex items-center justify-between rounded-lg border p-3">
      <div className="flex items-start gap-3">
        <div className="relative size-10">
          <Image
            src={crop.image}
            alt={crop.label}
            fill
            className="object-cover"
          />
        </div>
        <div className="grid gap-1.5 font-normal">
          <p className="text-muted text-base font-medium leading-none">
            {crop.label}
          </p>
          <p className="text-muted-foreground text-sm">{crop.category}</p>
        </div>
      </div>
      <Checkbox
        id={name}
        checked={isChecked}
        onCheckedChange={handleCheckedChange}
        className="data-[state=checked]:border-primary data-[state=checked]:bg-primary dark:data-[state=checked]:border-primary dark:data-[state=checked]:bg-primary data-[state=checked]:text-white"
      />
    </Label>
  );
}
