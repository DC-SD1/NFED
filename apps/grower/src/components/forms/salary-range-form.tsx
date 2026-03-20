"use client";

import { Button, Label } from "@cf/ui";
import { DualRangeSlider } from "@cf/ui/components/dual-range-slider";
import { CustomRadioButton } from "@cf/ui/components/radio-button"; // 👈 Adjust the path if needed
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import React, { useState } from "react";

const SalaryRangeForm = () => {
  const [salaryRange, setSalaryRange] = useState({ min: 20, max: 260 });
  const [accommodation, setAccommodation] = useState("");
  const t = useTranslations("dashboard.hireManager");
  const router = useRouter();

  const handleSalaryChange = (range: { min: number; max: number }) => {
    setSalaryRange(range);
    console.log("Salary range changed:", range);
  };

  const handleSubmit = () => {
    console.log({
      minSalary: salaryRange.min,
      maxSalary: salaryRange.max,
      accommodation,
    });
    router.push("/farm-owner/farm-managers/hire-manager/success");
  };

  return (
    <div className="">
      <div className="space-y-6 text-start">
        {/* Header */}
        <div>
          <h2 className="mb-2 text-lg font-semibold">{t("salaryRange")}</h2>
          <p className="text-muted-foreground text-sm leading-6">
            {t("averageSalary", { amount: "GHS260" })}
          </p>
        </div>

        {/* Slider */}
        <div className="flex flex-col items-center space-y-4 pt-10">
          <DualRangeSlider
            min={0}
            max={500}
            step={10}
            initialMinValue={20}
            initialMaxValue={260}
            prefix="GHS"
            minLabel={t("minSalary")}
            maxLabel={t("maxSalary")}
            onChange={handleSalaryChange}
          />
        </div>

        {/* Accommodation Section */}
        <div className="space-y-4">
          <h2 className="mb-2 text-lg font-semibold">
            {t("accommodationRequired")}
          </h2>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <CustomRadioButton
                isSelected={accommodation === "yes"}
                onClick={() => setAccommodation("yes")}
              />
              <Label htmlFor="yes">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <CustomRadioButton
                isSelected={accommodation === "no"}
                onClick={() => setAccommodation("no")}
              />
              <Label htmlFor="no">No</Label>
            </div>
          </div>
        </div>

        {/* Submit Button */}
      </div>
      <div className="mt-20 sm:mt-10">
        <Button
          onClick={handleSubmit}
          className="bg-primary flex w-full items-center justify-center rounded-xl px-6 py-4 font-medium text-white transition-colors duration-200"
        >
          {t("submit")}
          <ChevronRight className="ml-2 size-5" />
        </Button>
      </div>
    </div>
  );
};

export default SalaryRangeForm;
