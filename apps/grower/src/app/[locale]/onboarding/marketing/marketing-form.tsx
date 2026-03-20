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

const marketingSchema = z.object({
  sources: z.array(z.string()).min(1, "errors.selectAtLeastOne"),
  otherDetails: z.string().optional(),
});

type MarketingData = z.infer<typeof marketingSchema>;

export function MarketingForm() {
  const t = useTranslations("onboarding.marketing");
  const router = useRouter();
  const setMarketingAttribution = useSignUpStore(
    (state) => state.setMarketingAttribution,
  );
  const { marketingChannels } = useSignUpStore();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<MarketingData>({
    resolver: zodResolver(marketingSchema),
    defaultValues: {
      sources: marketingChannels ?? [],
      otherDetails: "",
    },
  });

  const selectedSources = watch("sources");

  const onSubmit = (data: MarketingData) => {
    const sources = data.sources.map((source) => {
      switch (source) {
        case "instagram":
        case "facebook":
        case "linkedin":
        case "youtube":
          return "socialMedia";
        case "google-search":
          return "searchEngine";
        case "friends-family":
          return "wordOfMouth";
        case "radio-newspaper":
        case "event-trade-fair":
          return "newsMedia";
        case "cf-agent-representative":
          return "advertisement";
        case "other":
        default:
          return "other";
      }
    });
    setMarketingAttribution(sources, data.otherDetails);
    router.push("/onboarding/segmentation");
  };

  const sources = [
    { value: "friends-family", label: t("options.friends-family") },
    {
      value: "cf-agent-representative",
      label: t("options.cf-agent-representative"),
    },
    { value: "instagram", label: t("options.instagram") },
    { value: "facebook", label: t("options.facebook") },
    { value: "linkedin", label: t("options.linkedin") },
    { value: "youtube", label: t("options.youtube") },
    { value: "google-search", label: t("options.google-search") },
    { value: "radio-newspaper", label: t("options.radio-newspaper") },
    { value: "event-trade-fair", label: t("options.event-trade-fair") },
    { value: "other", label: t("options.other") },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      <div className="relative">
        <div className="max-h-[40vh] w-full space-y-6 overflow-y-auto pr-4 lg:max-h-[50vh] lg:w-[40vw] lg:pr-16">
          {sources.map((source) => (
            <ControlledCheckbox
              key={source.value}
              control={control}
              name="sources"
              id={source.value}
              value={source.value}
              label={source.label}
            />
          ))}
        </div>

        {errors.sources && (
          <p className="mt-2 text-sm text-red-500">
            {t(errors.sources.message as any)}
          </p>
        )}

        <div className="mt-6 w-full">
          <Button
            className="w-full"
            type="button"
            disabled={selectedSources.length === 0}
            onClick={handleSubmit(onSubmit)}
          >
            {t("next")}
            <ChevronRight className="ml-2 size-4" />
          </Button>
        </div>
      </div>
    </form>
  );
}
