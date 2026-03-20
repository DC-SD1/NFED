"use client";

import { Button } from "@cf/ui/components/button";
import { Card, CardContent } from "@cf/ui/components/card";
import { ChevronRight } from "@cf/ui/icons";
import * as RadioGroup from "@radix-ui/react-radio-group";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

type ResidentType = "local" | "international";

interface ResidentTypeCardProps {
  option: {
    value: ResidentType;
    title: string;
    description: string;
  };
  isSelected: boolean;
}

function ResidentTypeCard({ option, isSelected }: ResidentTypeCardProps) {
  return (
    <RadioGroup.Item value={option.value} asChild>
      <Card
        className="active:shadow-[0px_2px_32px_0px_rgba(22,29,20,0.1) cursor-pointer rounded-2xl shadow-[0px_4px_64px_0px_rgba(22,29,20,0.15)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0px_8px_80px_0px_rgba(22,29,20,0.2)] active:translate-y-0"
        tabIndex={0}
        role="radio"
        aria-checked={isSelected}
      >
        <CardContent className="flex items-center p-6">
          <div className="mr-4 shrink-0">
            <div
              className={`flex size-5 items-center justify-center rounded-full border-2 transition-colors ${
                isSelected ? "border-primary bg-primary" : "border-gray-semi"
              }`}
            >
              <div
                className={`size-4 rounded-full bg-transparent ${
                  isSelected ? "border-6 bg-primary border border-white" : ""
                }`}
              />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-foreground mb-1 text-base font-semibold">
              {option.title}
            </h3>
            <p className="text-muted-foreground text-sm leading-5">
              {option.description}
            </p>
          </div>
        </CardContent>
      </Card>
    </RadioGroup.Item>
  );
}

export function ResidentTypeForm() {
  const t = useTranslations("dashboard.kyc");
  const tCommon = useTranslations("common");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<"local" | "international">();

  const router = useRouter();

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (selectedType === "local") {
      router.push("/farm-owner/kyc/resident-submit");
    } else {
      router.push("/farm-owner/kyc/international-submit");
    }

    setIsLoading(false);
  };

  const residentDetails: {
    value: ResidentType;
    title: string;
    description: string;
  }[] = [
    {
      value: "local",
      title: t("localTitle"),
      description: t("localSub"),
    },
    {
      value: "international",
      title: t("internationalTitle"),
      description: t("internationalSub"),
    },
  ];

  return (
    <form onSubmit={handleFormSubmit} className="space-y-8">
      <div className="space-y-4">
        <p className="text-md text-muted-foreground mb-8 text-start lg:text-center">
          {t("kycSub")}
        </p>

        <RadioGroup.Root
          value={selectedType}
          onValueChange={(val) =>
            setSelectedType(val as "local" | "international")
          }
          className="flex flex-col gap-4"
        >
          {residentDetails.map((option) => (
            <ResidentTypeCard
              key={option.value}
              option={option}
              isSelected={selectedType === option.value}
            />
          ))}
        </RadioGroup.Root>
      </div>
      <div className="!mt-16 flex items-center justify-center sm:mt-10">
        <Button
          type="submit"
          className="bg-primary w-full md:w-3/4"
          disabled={isLoading || !selectedType}
        >
          {isLoading ? tCommon("processing") : "Next"}
          <ChevronRight className="ml-2 size-4" />
        </Button>
      </div>
    </form>
  );
}
