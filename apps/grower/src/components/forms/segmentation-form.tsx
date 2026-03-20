"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";

import experiencedImage from "@/assets/images/experienced.png";
import newImage from "@/assets/images/newbie.png";
import {
  type SegmentationFormData,
  segmentationSchema,
} from "@/lib/schemas/sign-up";
import { useSignUpStore } from "@/lib/stores/sign-up-store";

interface SegmentationFormProps {
  onSubmit: (data: SegmentationFormData) => void;
  isLoading?: boolean;
}

export function SegmentationForm({ onSubmit }: SegmentationFormProps) {
  const t = useTranslations("onboarding.segmentation");
  const { userSegment } = useSignUpStore();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SegmentationFormData>({
    resolver: zodResolver(segmentationSchema),
    defaultValues: {
      userType: userSegment || undefined,
    },
  });

  const selectedType = watch("userType");

  const userTypeOptions = [
    {
      value: "newbie",
      label: t("new-label"),
      description: t("new-description"),
      image: newImage,
    },
    {
      value: "experienced",
      label: t("experienced-label"),
      description: t("experienced-description"),
      image: experiencedImage,
    },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="min-h-50vh space-y-6">
      <div className="mt-2 space-y-1">
        <div className="grid grid-cols-2 gap-4">
          {userTypeOptions.map((option) => {
            const isSelected = selectedType === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setValue(
                    "userType",
                    option.value as "newbie" | "experienced",
                  );
                  void handleSubmit(onSubmit)();
                }}
                className={`
                  relative flex w-full flex-col rounded-2xl p-4 text-left transition-all focus:outline-none lg:min-h-[40vh]
                  ${isSelected ? "border border-green-500 bg-green-50" : "border-input-border border"}
                `}
              >
                <input
                  type="radio"
                  value={option.value}
                  {...register("userType")}
                  className="hidden"
                />

                <div className="relative mb-6 h-40 w-full overflow-hidden rounded-xl lg:mb-10 lg:h-60">
                  <Image
                    src={option.image}
                    alt={option.label}
                    fill
                    style={{ objectFit: "cover" }}
                    className="rounded-xl"
                  />
                  {isSelected && (
                    <div className="bg-primary absolute right-2 top-2 z-10 rounded-full p-1">
                      <Check size={15} color="white" />
                    </div>
                  )}
                </div>
                <div className="text-start">
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">
                    {option.label}
                  </h3>
                  <p className="text-sm text-gray-600">{option.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        {errors.userType && (
          <p className="text-sm text-red-500">
            {errors.userType?.message || "Please select an option"}
          </p>
        )}
      </div>
    </form>
  );
}
