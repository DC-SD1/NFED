"use client";

import { Button } from "@cf/ui/components/button";
import { RadioGroup, RadioGroupItem } from "@cf/ui/components/radio-group";
import { ChevronRight } from "@cf/ui/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useInviteUserStore } from "@/lib/stores/invite-user";

const workPaySchema = z.object({
  workPayType: z.string(),
});

type WorkPayFormData = z.infer<typeof workPaySchema>;

interface WorkPayFormProps {
  onSubmit: (data: WorkPayFormData) => void;
  isLoading?: boolean;
}

export function ManagerWorkPayForm({ onSubmit, isLoading }: WorkPayFormProps) {
  const t = useTranslations("dashboard.inviteManager");
  const tCommon = useTranslations("common");

  const workTypeOptions = [
    { value: "payRoll", label: t("payroll") },
    { value: "equityYield", label: t("equityYield") },
    { value: "hybrid", label: t("hybrid") },
  ];

  const { handleSubmit, watch, setValue } = useForm<WorkPayFormData>({
    resolver: zodResolver(workPaySchema),
  });

  const selectedWorkPayType = watch("workPayType");

  const handleSelect = (value: string) => {
    setValue("workPayType", value, { shouldValidate: true });
  };

  const handleFormSubmit = async (data: WorkPayFormData) => {
    await useInviteUserStore
      .getState()
      .setWorkPayType(data.workPayType as "payRoll" | "equityYield" | "hybrid");
    onSubmit(data);
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
          disabled={isLoading}
        >
          {workTypeOptions.map((option) => (
            <RadioGroupItem
              key={option.value}
              value={option.value}
              label={option.label}
              selected={selectedWorkPayType === option.value}
              onClick={() => !isLoading && handleSelect(option.value)}
              disabled={isLoading}
              itemClassName="bg-transparent border border-solid border-[#73796E]"
              unselectedRadioClass="border-gray-300"
            />
          ))}
        </RadioGroup>
      </div>

      <div className="mt-32 space-y-4">
        <Button
          type="submit"
          className="w-full rounded-xl"
          disabled={isLoading || !selectedWorkPayType}
        >
          {isLoading ? tCommon("processing") : tCommon("saveAndSend")}
          <ChevronRight className="ml-2 size-4" />
        </Button>
        {/* <Button
          type="submit"
          variant="outline"
          disabled
          className="w-full rounded-xl bg-[#E8EBE1] text-[#1A5514] hover:bg-[#E8EBE1] 
          disabled:pointer-events-auto disabled:cursor-not-allowed disabled:opacity-50"
        >
          {tCommon("saveAsDraft")}
          <ChevronRight className="size-4" />
        </Button> */}
      </div>
    </form>
  );
}
