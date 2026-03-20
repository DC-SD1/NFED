"use client";
import { Accordion, cn, Form } from "@cf/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import React, { useEffect } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useSourcingStore } from "@/lib/stores/sourcing-store";

import { QuantitySelector } from "../../../_components/quantity-selector";
import CropSpecificationAccordionItem from "./crop-specification-accordion-item";

const CROP_SPECIFICATION = {
  cropSpecification: {
    variety: { label: "Variety", value: "Legin-18" },
    condition: { label: "Condition", value: "Fresh" },
    grade: { label: "Grade", value: "Grade A" },
    cultivationType: { label: "Cultivation type", value: "Conventional" },
    packagingType: { label: "Packaging type", value: "50 kg PP bags" },
  },
  otherSpecification: [
    "Moisture 12.5 % Max",
    "Total defective grains(mouldy, shrivelled, damaged grains) 5% max",
    "Total Aflatoxins(20 pp max)",
    "Live insects - Absent",
  ],
  certificates: [
    "Non-GMO",
    "Certificate of origin",
    "Total Aflatoxins(20 pp max)",
  ],
  testingType: [
    "Shelf life test",
    "Durability assessment",
    "Product quality inspection",
  ],
};

const CROP_SPECIFICATION_DATA = {
  cropVariety: CROP_SPECIFICATION.cropSpecification.variety.value,
  cultivationType: CROP_SPECIFICATION.cropSpecification.cultivationType.value,
  grade: CROP_SPECIFICATION.cropSpecification.grade.value,
  processingStyle: CROP_SPECIFICATION.cropSpecification.condition.value, // Is this on /product/product_id? Is this under specifications but specifications is string[].
  packagingStyle: CROP_SPECIFICATION.cropSpecification.packagingType.value,
  certificationType: CROP_SPECIFICATION.certificates[0],
  testingType: CROP_SPECIFICATION.otherSpecification[0], // Is this on /product/product_id?
};

export default function CropSpecificationForm() {
  const t = useTranslations("sourcing.availableCrops.cropSpecification");

  const {
    cropSpecification,
    saveCropSpecification, // Will mark this step as completed, and enable the continue button.
    isAvailableCropSpecificationValid,
    setCurrentStepValid,
  } = useSourcingStore();

  const formSchema = z.object({
    quantity: z.number().min(1, t("form.validation.quantityRequired")),
  });

  type CropSpecificationFormValues = z.infer<typeof formSchema>;

  const form = useForm<CropSpecificationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quantity: cropSpecification?.quantity || 0,
    },
  });

  const handleSubmit: SubmitHandler<CropSpecificationFormValues> = (data) => {
    if (isAvailableCropSpecificationValid(data)) {
      saveCropSpecification({
        quantity: data.quantity,
        ...CROP_SPECIFICATION_DATA,
      });
    }
  };

  const watchedValues = form.watch();

  useEffect(() => {
    const isValid = isAvailableCropSpecificationValid(watchedValues);

    setCurrentStepValid(isValid);

    // Re: auto-save when form is valid (with debounce to prevent infinite loops).
    if (isValid) {
      const timer = setTimeout(() => {
        saveCropSpecification({
          quantity: watchedValues.quantity,
          ...CROP_SPECIFICATION_DATA,
        });
      }, 500);

      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedValues.quantity, setCurrentStepValid, saveCropSpecification]);

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="block space-y-5"
        >
          <QuantitySelector register={form.register} />

          {/* Re: hidden submit button for auto-save functionality. */}
          <button type="submit" style={{ display: "none" }} />
        </form>
      </Form>

      <Accordion type="multiple" className="w-full space-y-6">
        {/* Crop specification. */}
        <CropSpecificationAccordionItem title="Crop specification">
          <>
            {Object.values(CROP_SPECIFICATION.cropSpecification).map(
              (cropSpecification, index) => {
                return (
                  <div
                    key={index}
                    className={cn(
                      "space-y-2 py-4",
                      index !==
                        Object.values(CROP_SPECIFICATION.cropSpecification)
                          .length -
                          1
                        ? "border-b border-[hsl(var(--border-light))]"
                        : "",
                    )}
                  >
                    <span className="text-sm font-bold text-[#586665]">
                      {cropSpecification.label}
                    </span>
                    <p>{cropSpecification.value}</p>
                  </div>
                );
              },
            )}
          </>
        </CropSpecificationAccordionItem>

        {/* Other specification. */}
        <CropSpecificationAccordionItem title="Other specification">
          <>
            {CROP_SPECIFICATION.otherSpecification.map(
              (specification, index) => {
                return (
                  <p
                    key={index}
                    className={cn(
                      "py-4",
                      index !== CROP_SPECIFICATION.otherSpecification.length - 1
                        ? "border-b border-[hsl(var(--border-light))]"
                        : "",
                    )}
                  >
                    {specification}
                  </p>
                );
              },
            )}
          </>
        </CropSpecificationAccordionItem>

        {/* Certificates. */}
        <CropSpecificationAccordionItem title="Certificates">
          <>
            {CROP_SPECIFICATION.certificates.map((certificate, index) => {
              return (
                <p
                  key={index}
                  className={cn(
                    "py-4",
                    index !== CROP_SPECIFICATION.certificates.length - 1
                      ? "border-b border-[hsl(var(--border-light))]"
                      : "",
                  )}
                >
                  {certificate}
                </p>
              );
            })}
          </>
        </CropSpecificationAccordionItem>

        {/* Testing type. */}
        <CropSpecificationAccordionItem title="Testing type">
          <>
            {CROP_SPECIFICATION.testingType.map((testingType, index) => {
              return (
                <p
                  key={index}
                  className={cn(
                    "py-4",
                    index !== CROP_SPECIFICATION.testingType.length - 1
                      ? "border-b border-[hsl(var(--border-light))]"
                      : "",
                  )}
                >
                  {testingType}
                </p>
              );
            })}
          </>
        </CropSpecificationAccordionItem>
      </Accordion>
    </>
  );
}
