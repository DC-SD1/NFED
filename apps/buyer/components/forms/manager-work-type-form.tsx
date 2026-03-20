"use client";

import { Button } from "@cf/ui/components/button";
import { RadioGroup, RadioGroupItem } from "@cf/ui/components/radio-group";
import { ChevronRight } from "@cf/ui/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useInviteUserStore } from "@/lib/stores/invite-user"; // add this

const workTypeSchema = z.object({
  workType: z.string(),
});

type WorkTypeFormData = z.infer<typeof workTypeSchema>;

interface WorkTypeFormProps {
  onSubmit: (data: WorkTypeFormData) => void;
}

export function ManagerWorkTypeForm({ onSubmit }: WorkTypeFormProps) {
  const t = useTranslations("dashboard.inviteManager");
  const tCommon = useTranslations("common");
  const [isLoading, setIsLoading] = useState(false);

  const workTypeOptions = [
    { value: "fullTime", label: t("fullTime") },
    { value: "contractor", label: t("contractor") },
  ];

  const { handleSubmit, watch, setValue } = useForm<WorkTypeFormData>({
    resolver: zodResolver(workTypeSchema),
  });

  const selectedWorkType = watch("workType");

  const handleSelect = (value: string) => {
    setValue("workType", value, { shouldValidate: true });
  };

  const handleFormSubmit = async (data: WorkTypeFormData) => {
    setIsLoading(true);
    await useInviteUserStore
      .getState()
      .setWorkType(data.workType as "fullTime" | "contractor");
    onSubmit(data);
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <div className="space-y-8">
        <p className="text-muted-foreground text-md text-start lg:text-center">
          {t("workType")}
        </p>

        <RadioGroup
          value={selectedWorkType}
          onValueChange={(val) => handleSelect(val)}
        >
          {workTypeOptions.map((option) => (
            <RadioGroupItem
              key={option.value}
              value={option.value}
              label={option.label}
              selected={selectedWorkType === option.value}
              onClick={() => handleSelect(option.value)}
              itemClassName="bg-transparent border border-solid border-[#73796E]"
              unselectedRadioClass="border-gray-300"
            />
          ))}
        </RadioGroup>
      </div>

      <div className="mt-32 space-y-20">
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || !selectedWorkType}
        >
          {isLoading ? tCommon("processing") : tCommon("next")}
          <ChevronRight className="ml-2 size-4" />
        </Button>
      </div>
    </form>
  );
}
