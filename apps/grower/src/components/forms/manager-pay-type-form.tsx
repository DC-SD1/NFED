"use client";

import { Button } from "@cf/ui/components/button";
import { RadioGroup, RadioGroupItem } from "@cf/ui/components/radio-group";
import { ChevronRight } from "@cf/ui/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useInviteUserStore } from "@/lib/stores/invite-user";

const workPaySchema = z.object({
  workPayType: z.string(),
});

type WorkPayFormData = z.infer<typeof workPaySchema>;

interface WorkPayFormProps {
  onSubmit: (data: WorkPayFormData, isDraft: boolean) => void;
  loadingType: "draft" | "submit" | null;
}

export function ManagerWorkPayForm({
  onSubmit,
  loadingType,
}: WorkPayFormProps) {
  const t = useTranslations("dashboard.inviteManager");
  const tCommon = useTranslations("common");
  const [isDraft, setIsDraft] = useState(false);
  const workPayType = useInviteUserStore((state) => state.workPayType);

  const workTypeOptions = [
    { value: "Payroll", label: t("payroll") },
    { value: "EquityYield", label: t("equityYield") },
    { value: "Hybrid", label: t("hybrid") },
  ];

  const { handleSubmit, watch, setValue } = useForm<WorkPayFormData>({
    resolver: zodResolver(workPaySchema),
    defaultValues: {
      workPayType: workPayType || "",
    },
  });

  const selectedWorkPayType = watch("workPayType");

  const handleSelect = (value: string) => {
    setValue("workPayType", value, { shouldValidate: true });
  };

  const handleFormSubmit = async (data: WorkPayFormData) => {
    await useInviteUserStore
      .getState()
      .setWorkPayType(data.workPayType as "Payroll" | "EquityYield" | "Hybrid");
    onSubmit(data, isDraft);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <div className="space-y-8">
        <p className="text-muted-foreground text-md text-start lg:text-center">
          {t("workPayType")}
        </p>

        <RadioGroup
          value={selectedWorkPayType}
          onValueChange={(val) => handleSelect(val)}
          disabled={!!loadingType}
        >
          {workTypeOptions.map((option) => (
            <RadioGroupItem
              key={option.value}
              value={option.value}
              label={option.label}
              selected={selectedWorkPayType === option.value}
              onClick={() => !loadingType && handleSelect(option.value)}
              disabled={!!loadingType}
              itemClassName="bg-transparent border border-solid border-input-border"
              unselectedRadioClass="border-gray-300"
            />
          ))}
        </RadioGroup>
      </div>

      <div className="mt-32 space-y-4">
        <Button
          type="submit"
          className="w-full rounded-xl"
          disabled={!!loadingType || !selectedWorkPayType}
          onClick={() => setIsDraft(false)}
        >
          {loadingType === "submit"
            ? tCommon("processing")
            : tCommon("saveAndSend")}
          <ChevronRight className="ml-2 size-4" />
        </Button>

        <Button
          type="submit"
          onClick={() => setIsDraft(true)}
          disabled={!!loadingType || !selectedWorkPayType}
          className="bg-input text-primary-darkest hover:bg-muted hover w-full rounded-xl"
        >
          {loadingType === "draft"
            ? tCommon("processing")
            : tCommon("saveAsDraft")}
          <ChevronRight className="ml-2 size-4" />
        </Button>
      </div>
    </form>
  );
}
