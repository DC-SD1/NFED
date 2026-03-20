"use client";

import { Form, FormTextareaInput } from "@cf/ui";
import { FormSelectInput } from "@cf/ui/components/form-select-input";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconInfoCircleFilled } from "@tabler/icons-react";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

import AeroplaneImg from "@/assets/images/sourcing/aeroplane.png";
import ShipImg from "@/assets/images/sourcing/ship.png";
import TruckImg from "@/assets/images/sourcing/truck.png";
import { FormInputTagWithButton } from "@/components/form-input-tag-with-button";
import { RadioField } from "@/components/forms/radio-field";
import airports from "@/lib/constants/airports.json";
import countries from "@/lib/constants/country.json";
import seaports from "@/lib/constants/sea-ports.json";
import shippingOptions from "@/lib/constants/shipping-options.json";
import { useSourcingStore } from "@/lib/stores/sourcing-store";

import {
  type ShippingOptionEntry,
  ShippingOptionSheet,
} from "./shipping-option-sheet";

const shippingMethodOptions = [
  {
    label: "Air",
    value: "air",
    image: AeroplaneImg.src,
    incoterms: [
      { label: "EXW (Ex Works)", value: "EXW" },
      { label: "FCA (Free Carrier)", value: "FCA" },
    ],
  },
  {
    label: "Land",
    value: "land",
    image: TruckImg.src,
    incoterms: [
      { label: "EXW (Ex Works)", value: "EXW" },
      { label: "FCA (Free Carrier)", value: "FCA" },
    ],
  },
  {
    label: "Sea",
    value: "sea",
    image: ShipImg.src,
    incoterms: [
      { label: "EXW (Ex Works)", value: "EXW" },
      { label: "FCA (Free Carrier)", value: "FCA" },
      { label: "FAS (Free Alongside Ship)", value: "FAS" },
      { label: "FOB (Free on Board)", value: "FOB" },
      { label: "CFR (Cost and Freight)", value: "CFR" },
      { label: "CIF (Cost, Insurance, and Freight)", value: "CIF" },
    ],
  },
];

// Create validation schema with conditional logic
const shippingMethodSchema = z
  .object({
    shippingMethod: z.enum(["air", "land", "sea"]).optional(),
    incoterms: z.enum(["EXW", "FCA", "FAS", "FOB", "CFR", "CIF"]).optional(),
    country: z.string().min(1, "Please select a country"),
    // Conditional fields based on shipping method
    airport: z.string().optional(),
    seaport: z.string().optional(),
    deliveryAddress: z.string().optional(),
    // Optional field for available-crops flow
    preferredDeliveryTimeline: z.string().optional(),
    // Additional documents as array of strings
    additionalDocuments: z.array(z.string()).optional(),
  })
  .superRefine((data, ctx) => {
    // Validate shipping method is selected
    if (!data.shippingMethod) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please select a shipping method",
        path: ["shippingMethod"],
      });
      return; // Don't continue validation if shipping method is not selected
    }

    // Validate incoterms is selected
    if (!data.incoterms) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please select an incoterm",
        path: ["incoterms"],
      });
    }
    // Validate Air shipping method
    if (data.shippingMethod === "air") {
      if (!data.airport || data.airport.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please select an airport for air shipping",
          path: ["airport"],
        });
      }
    }

    // Validate Sea shipping method
    if (data.shippingMethod === "sea") {
      if (!data.seaport || data.seaport.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please select a seaport for sea shipping",
          path: ["seaport"],
        });
      }
    }

    // Validate Land shipping method
    if (data.shippingMethod === "land") {
      if (!data.deliveryAddress || data.deliveryAddress.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please enter a delivery address for land shipping",
          path: ["deliveryAddress"],
        });
      }
      if (data.deliveryAddress && data.deliveryAddress.trim().length < 10) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Delivery address must be at least 10 characters long",
          path: ["deliveryAddress"],
        });
      }
    }
  });

type ShippingMethodFormData = z.infer<typeof shippingMethodSchema>;

// eslint-disable-next-line max-lines-per-function
export function ShippingMethodForm() {
  const pathname = usePathname();
  // const isSourcingAvailableCrops = useMemo(
  //   () => pathname?.includes("/available-crops/") ?? false,
  //   [pathname],
  // );

  const {
    shippingMethod: savedShippingMethod,
    saveShippingMethod,
    isShippingMethodValid,
    setCurrentStepValid,
  } = useSourcingStore();

  const form = useForm<ShippingMethodFormData>({
    resolver: zodResolver(shippingMethodSchema),
    defaultValues: {
      shippingMethod: undefined,
      incoterms: undefined,
      country: "",
      airport: "",
      seaport: "",
      deliveryAddress: "",
      preferredDeliveryTimeline: undefined,
      additionalDocuments: [],
    },
    mode: "onChange", // Enable real-time validation
  });

  // Reset form with saved data when component mounts or saved data changes
  useEffect(() => {
    // Use setTimeout to ensure the form is properly initialized
    const timeoutId = setTimeout(() => {
      if (savedShippingMethod) {
        const formData: ShippingMethodFormData = {
          shippingMethod: savedShippingMethod.shippingMethod ?? undefined,
          incoterms: savedShippingMethod.incoterms ?? undefined,
          country: savedShippingMethod.country || "",
          airport: savedShippingMethod.airport || "",
          seaport: savedShippingMethod.seaport || "",
          deliveryAddress: savedShippingMethod.deliveryAddress || "",
          preferredDeliveryTimeline:
            savedShippingMethod.preferredDeliveryTimeline || undefined,
          additionalDocuments: savedShippingMethod?.additionalDocuments || [],
        };

        form.reset(formData);

        // Also update the validation state for the saved data
        const isValid = isShippingMethodValid(formData);
        setCurrentStepValid(isValid);
      } else {
        // Reset to empty form if no saved data

        form.reset({
          shippingMethod: undefined,
          incoterms: undefined,
          country: "",
          airport: "",
          seaport: "",
          deliveryAddress: "",
          preferredDeliveryTimeline: undefined,
          additionalDocuments: [],
        });
        setCurrentStepValid(false);
      }
    }, 100); // Small delay to ensure form is ready

    return () => clearTimeout(timeoutId);
  }, [savedShippingMethod, form, isShippingMethodValid, setCurrentStepValid]);

  const onSubmit: SubmitHandler<ShippingMethodFormData> = (data) => {
    // Save to store - only if all required fields are present
    if (data.shippingMethod && data.incoterms && data.country) {
      const completeData = {
        shippingMethod: data.shippingMethod,
        incoterms: data.incoterms,
        country: data.country,
        airport: data.airport,
        seaport: data.seaport,
        deliveryAddress: data.deliveryAddress,
        preferredDeliveryTimeline: data.preferredDeliveryTimeline,
        additionalDocuments: data.additionalDocuments,
      } as ShippingMethodFormData;
      saveShippingMethod(completeData);
    }
  };

  // Watch the shipping method and country fields
  const selectedShippingMethod = form.watch("shippingMethod");
  const selectedCountry = form.watch("country");
  const selectedIncoterms = form.watch("incoterms");
  const selectedAirport = form.watch("airport");
  const selectedSeaport = form.watch("seaport");
  const selectedDeliveryAddress = form.watch("deliveryAddress");
  const selectedPreferredDeliveryTimeline = form.watch(
    "preferredDeliveryTimeline",
  );
  const selectedAdditionalDocuments = form.watch("additionalDocuments");

  // Create a stable form data object
  const currentFormData = useMemo(
    () => ({
      shippingMethod: selectedShippingMethod,
      incoterms: selectedIncoterms,
      country: selectedCountry,
      airport: selectedAirport,
      seaport: selectedSeaport,
      deliveryAddress: selectedDeliveryAddress,
      preferredDeliveryTimeline: selectedPreferredDeliveryTimeline,
      additionalDocuments: selectedAdditionalDocuments,
    }),
    [
      selectedShippingMethod,
      selectedIncoterms,
      selectedCountry,
      selectedAirport,
      selectedSeaport,
      selectedDeliveryAddress,
      selectedPreferredDeliveryTimeline,
      selectedAdditionalDocuments,
    ],
  );

  // Use ref to track previous form data to prevent unnecessary updates
  const previousFormDataRef = useRef<string>("");
  const previousShippingMethodRef = useRef<string | undefined>(undefined);

  // Memoize the validation function
  const validateAndSave = useCallback(() => {
    const formDataString = JSON.stringify(currentFormData);

    // Skip if form data hasn't changed
    if (previousFormDataRef.current === formDataString) {
      return;
    }

    previousFormDataRef.current = formDataString;

    const isValid = isShippingMethodValid(currentFormData);
    setCurrentStepValid(isValid);

    // Auto-save when form is valid and all required fields are present
    if (
      isValid &&
      currentFormData.shippingMethod &&
      currentFormData.incoterms &&
      currentFormData.country
    ) {
      const completeData = {
        shippingMethod: currentFormData.shippingMethod,
        incoterms: currentFormData.incoterms,
        country: currentFormData.country,
        airport: currentFormData.airport,
        seaport: currentFormData.seaport,
        deliveryAddress: currentFormData.deliveryAddress,
        preferredDeliveryTimeline: currentFormData.preferredDeliveryTimeline,
        additionalDocuments: currentFormData.additionalDocuments,
      } as ShippingMethodFormData;
      saveShippingMethod(completeData);
    }
  }, [
    currentFormData,
    isShippingMethodValid,
    setCurrentStepValid,
    saveShippingMethod,
  ]);

  // Real-time validation and auto-save with stable dependencies
  useEffect(() => {
    validateAndSave();
  }, [validateAndSave]);

  // Filter incoterms based on selected shipping method
  const filteredIncoterms = useMemo(() => {
    if (!selectedShippingMethod) {
      return [];
    }
    const shippingMethod = shippingMethodOptions.find(
      (method) => method.value === selectedShippingMethod,
    );
    return shippingMethod?.incoterms || [];
  }, [selectedShippingMethod]);

  // Filter airports based on selected country
  const filteredAirports = useMemo(() => {
    if (!selectedCountry) {
      return [];
    }
    return airports.filter((airport) => airport.country === selectedCountry);
  }, [selectedCountry]);

  // Filter seaports based on selected country
  const filteredSeaports = useMemo(() => {
    if (!selectedCountry) {
      return [];
    }
    // Convert seaports object to array and filter by country
    const seaportsArray = Object.values(seaports);
    return seaportsArray.filter((port) => port.country === selectedCountry);
  }, [selectedCountry]);

  // Reset incoterms when shipping method changes
  useEffect(() => {
    const previousMethod = previousShippingMethodRef.current;
    const currentMethod = selectedShippingMethod;

    if (previousMethod !== undefined && previousMethod !== currentMethod) {
      form.setValue("incoterms", undefined, { shouldValidate: false });
    }

    previousShippingMethodRef.current = currentMethod;
  }, [selectedShippingMethod, form]);

  useEffect(() => {
    if (selectedCountry) {
      form.setValue("airport", ""); // Reset airport when country changes
      form.setValue("seaport", ""); // Reset seaport when country changes
    }
  }, [selectedCountry, form]);

  const isPersonalisedSourcing = pathname.includes("/personalised-crops");

  type ShippingOptionsByIncoterm = Record<string, ShippingOptionEntry[]>;

  const shippingOptionsData = selectedShippingMethod
    ? (shippingOptions[selectedShippingMethod] as ShippingOptionsByIncoterm)
    : undefined;

  const selectedShippingOption: ShippingOptionEntry[] | undefined =
    selectedIncoterms && shippingOptionsData
      ? shippingOptionsData[selectedIncoterms]
      : undefined;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <RadioField
          name="shippingMethod"
          label=""
          options={shippingMethodOptions}
          size="standard"
        />

        {selectedShippingMethod && (
          <div className="space-y-6">
            <div className="h-[80px] space-y-1 rounded-xl bg-[hsl(var(--background-light))] p-4">
              <p className="text-sm font-normal text-[#586665]">
                Airport of dispatch
              </p>
              <p>Kotako International Airport, Ghana</p>
            </div>

            {isPersonalisedSourcing && (
              <div className="flex h-[80px] items-center gap-4 rounded-xl bg-[#D5E3FD] p-4 text-[#00439E]">
                <IconInfoCircleFilled className="!size-6" />
                <div className="space-y-0.5">
                  <p className="text-sm font-bold">Production period</p>
                  <p>The production period will be from three to nine months</p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <FormSelectInput
                name="incoterms"
                label="Incoterms"
                placeholder="Select Incoterm"
                options={filteredIncoterms}
              />

              <div className="space-y-4">
                {selectedIncoterms ? (
                  selectedShippingOption?.length ? (
                    selectedShippingOption.map((option) => (
                      <ShippingOptionSheet
                        key={`${option.type}-${option.title}`}
                        option={option}
                      />
                    ))
                  ) : (
                    <div className="rounded-xl border border-dashed border-[#D5E3FD] bg-[hsl(var(--background-light))] p-4 text-sm text-[#586665]">
                      Supporting documents for this Incoterm will be available
                      soon.
                    </div>
                  )
                ) : null}

                <FormInputTagWithButton
                  name="additionalDocuments"
                  label="Add additional documents"
                  placeholder="Enter document name and separate multiple entries with (,)"
                />
              </div>

              <FormSelectInput
                name="country"
                label="Country"
                placeholder="Select Country"
                options={countries.countries.map((country) => ({
                  label: country.name,
                  value: country.name,
                }))}
                searchable
                searchPlaceholder="Search Country"
              />

              {selectedShippingMethod === "air" && (
                <FormSelectInput
                  name="airport"
                  label="Airport"
                  placeholder={
                    !selectedCountry ? "Select country first" : "Select Airport"
                  }
                  searchable
                  searchPlaceholder="Search Airport"
                  options={filteredAirports.map((airport) => ({
                    label: `${airport.name} (${airport.code})`,
                    value: airport.name,
                  }))}
                  disabled={!selectedCountry}
                />
              )}

              {selectedShippingMethod === "sea" && (
                <FormSelectInput
                  name="seaport"
                  label="Port of delivery"
                  placeholder={
                    !selectedCountry ? "Select country first" : "Select Seaport"
                  }
                  searchable
                  searchPlaceholder="Search Seaport"
                  options={filteredSeaports.map((port) => ({
                    label: `${port.name}, ${port.city}`,
                    value: port.name,
                  }))}
                  disabled={!selectedCountry}
                />
              )}

              {/* Show delivery address field only for Land shipping method */}
              {selectedShippingMethod === "land" && (
                <FormTextareaInput
                  name="deliveryAddress"
                  label="Delivery Address"
                  placeholder="Enter your delivery address..."
                />
              )}

              {/* {isSourcingAvailableCrops && (
                <FormSelectInput
                  name="preferredDeliveryTimeline"
                  label="Preferred delivery timeline"
                  placeholder="Select timeline"
                  options={[
                    { label: "Three to six months", value: "3-6 months" },
                    { label: "Six months to a year", value: "6-12 months" },
                    { label: "A year plus", value: "12+ months" },
                  ]}
                />
              )} */}
            </div>
          </div>
        )}
      </form>
    </Form>
  );
}
