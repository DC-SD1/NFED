"use client";

import { Form } from "@cf/ui";
import { FormSelectInput } from "@cf/ui/components/form-select-input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useSourcingStore } from "@/lib/stores/sourcing-store";

import { QuantitySelector } from "../../../_components/quantity-selector";

export function CropSpecificationForm() {
  const t = useTranslations("sourcing.cropSpecification");
  const {
    saveCropSpecification,
    isCropSpecificationValid,
    cropSpecification,
    setCurrentStepValid,
  } = useSourcingStore();

  const formSchema = z.object({
    quantity: z.number().min(1, t("validation.quantityRequired")),
    cropVariety: z.string().min(1, t("validation.varietyRequired")),
    cultivationType: z.string().min(1, t("validation.cultivationTypeRequired")),
    grade: z.string().min(1, t("validation.gradeRequired")),
    processingStyle: z.string().min(1, t("validation.processingStyleRequired")),
    packagingStyle: z.string().min(1, t("validation.packagingStyleRequired")),
    certificationType: z
      .string()
      .min(1, t("validation.certificationTypeRequired")),
    testingType: z.string().min(1, t("validation.testingTypeRequired")),
  });

  type PersonalisedCropSpecificationFormValues = z.infer<typeof formSchema>;

  const form = useForm<PersonalisedCropSpecificationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quantity: cropSpecification?.quantity || 0,
      cropVariety: cropSpecification?.cropVariety || "",
      cultivationType: cropSpecification?.cultivationType || "",
      grade: cropSpecification?.grade || "",
      processingStyle: cropSpecification?.processingStyle || "",
      packagingStyle: cropSpecification?.packagingStyle || "",
      certificationType: cropSpecification?.certificationType || "",
      testingType: cropSpecification?.testingType || "",
    },
  });

  // Watch form values for auto-save
  const watchedValues = form.watch();

  const handleSubmit: SubmitHandler<PersonalisedCropSpecificationFormValues> = (
    data,
  ) => {
    if (isCropSpecificationValid(data)) {
      saveCropSpecification(data);
    }
  };

  // Update validation state and auto-save when form is valid
  useEffect(() => {
    const isValid = isCropSpecificationValid(watchedValues);

    // Update continue button state immediately
    setCurrentStepValid(isValid);

    // Auto-save when form is valid (with debounce to prevent infinite loops)
    if (isValid) {
      const timer = setTimeout(() => {
        saveCropSpecification(watchedValues);
      }, 500); // 500ms debounce

      return () => clearTimeout(timer);
    }
  }, [
    watchedValues.quantity,
    watchedValues.cropVariety,
    watchedValues.cultivationType,
    watchedValues.grade,
    watchedValues.processingStyle,
    watchedValues.packagingStyle,
    watchedValues.certificationType,
    watchedValues.testingType,
    isCropSpecificationValid,
    setCurrentStepValid,
    saveCropSpecification,
  ]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="block space-y-5"
      >
        <QuantitySelector register={form.register} />

        <div className="space-y-4">
          <FormSelectInput
            name="cropVariety"
            label={t("form.labels.variety")}
            placeholder={t("form.placeholders.selectVariety")}
            options={[
              { label: "Legon-18", value: "legon18" },
              { label: "Legin-18", value: "lefin18" },
            ]}
          />

          <FormSelectInput
            name="cultivationType"
            label={t("form.labels.cultivationType")}
            placeholder={t("form.placeholders.selectCultivationType")}
            options={[
              { label: "Organic Non-GMO", value: "organicNonGMO" },
              { label: "Organic GMO", value: "organicGMO" },
              { label: "Conventional Non-GMO", value: "conventionalNonGMO" },
              { label: "Conventional GMO", value: "conventionalGMO" },
            ]}
          />

          <FormSelectInput
            name="grade"
            label={t("form.labels.grade")}
            placeholder={t("form.placeholders.selectGrade")}
            options={[
              { label: "Grade A", value: "gradeA" },
              { label: "Grade B", value: "gradeB" },
              { label: "Grade 3", value: "grade3" },
              { label: "Grade C", value: "gradeC" },
            ]}
          />

          <FormSelectInput
            name="processingStyle"
            label={t("form.labels.processingStyle")}
            placeholder={t("form.placeholders.selectProcessingStyle")}
            options={[
              { label: "Fresh", value: "fresh" },
              { label: "Frozen", value: "frozen" },
              { label: "Dried", value: "dried" },
              { label: "Other", value: "other" },
            ]}
          />

          <FormSelectInput
            name="packagingStyle"
            label={t("form.labels.packagingStyle")}
            placeholder={t("form.placeholders.selectPackagingStyle")}
            options={[
              { label: "50 kg PP bags", value: "50kgPPBags" },
              { label: "25 kg PP bags", value: "25kgPPBags" },
              { label: "10 kg PP bags", value: "10kgPPBags" },
              { label: "5 kg PP bags", value: "5kgPPBags" },
              { label: "Other", value: "other" },
            ]}
          />

          <FormSelectInput
            name="certificationType"
            label={t("form.labels.certificationType")}
            placeholder={t("form.placeholders.selectCertificationType")}
            options={[
              { label: "Non-certified", value: "non-certified" },
              { label: "Certified", value: "certified" },
            ]}
          />

          <FormSelectInput
            name="testingType"
            label={t("form.labels.testingType")}
            placeholder={t("form.placeholders.selectTestingType")}
            options={[
              { label: "No testing", value: "no-testing" },
              { label: "Testing", value: "testing" },
            ]}
          />
        </div>

        {/* Hidden submit button for auto-save functionality */}
        <button type="submit" style={{ display: "none" }} />
      </form>
    </Form>
  );
}
