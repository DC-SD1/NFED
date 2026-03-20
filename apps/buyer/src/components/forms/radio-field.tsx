"use client";

import { cn, FormControl, FormField, FormItem, FormLabel } from "@cf/ui";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { cva, type VariantProps } from "class-variance-authority";
import { CircleIcon } from "lucide-react";
import Image from "next/image";
import { useFormContext } from "react-hook-form";

import {
  FieldContent,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldTitle,
} from "../ui/field";
import { Field } from "../ui/field";

// Enhanced option interface with better typing
export interface RadioOption {
  label: string;
  value: string;
  image?: string;
  width?: number;
  height?: number;
  description?: string;
  disabled?: boolean;
}

// Variant styles for different layouts
const radioFieldVariants = cva(
  "relative w-full rounded-xl border border-gray-300 px-6 transition-all duration-200 cursor-pointer hover:border-gray-400",
  {
    variants: {
      size: {
        compact: "py-4 h-[56px]",
        standard: "py-10 h-[156px]",
        large: "py-4 h-[183px]",
      },
      selected: {
        true: "border-primary border-2 bg-[#F1FBFB] shadow-sm",
        false: "",
      },
      disabled: {
        true: "opacity-50 cursor-not-allowed",
        false: "",
      },
    },
    defaultVariants: {
      size: "standard",
      selected: false,
      disabled: false,
    },
  },
);

// Grid layout variants
const gridVariants = cva("grid gap-3 items-center", {
  variants: {
    columns: {
      1: "grid-cols-1",
      2: "grid-cols-2",
      3: "grid-cols-3",
      4: "grid-cols-4",
    },
  },
  defaultVariants: {
    columns: 3,
  },
});

export interface RadioFieldProps
  extends VariantProps<typeof radioFieldVariants> {
  name: string;
  label: string;
  options: RadioOption[];
  maxColumns?: 1 | 2 | 3 | 4;
  className?: string;
  optionClassName?: string;
  imageClassName?: string;
  labelClassName?: string;
  radioClassName?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  // Legacy props for backward compatibility
  isTop?: boolean;
  isMiddle?: boolean;
  customClass?: string;
}

export function RadioField({
  name,
  label,
  options,
  maxColumns = 3,
  size,
  className,
  optionClassName,
  imageClassName,
  labelClassName,
  radioClassName,
  description,
  required = false,
  disabled = false,
  // Legacy props
  isTop,
  isMiddle,
  customClass,
}: RadioFieldProps) {
  const { control } = useFormContext();

  // Handle legacy size props
  const effectiveSize =
    size || (isTop ? "standard" : isMiddle ? "large" : "compact");

  // Calculate grid columns based on options length and maxColumns
  const gridCols = Math.min(options.length, maxColumns) as 1 | 2 | 3 | 4;

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel
            className={cn(
              "font-bold text-[#586665]",
              required && "after:ml-0.5 after:text-red-500 after:content-['*']",
            )}
          >
            {label}
          </FormLabel>
          {description && (
            <p className="mb-4 text-sm text-gray-600">{description}</p>
          )}
          <FormControl>
            <FieldGroup>
              <FieldSet>
                <RadioGroupPrimitive.Root
                  value={field.value}
                  onValueChange={field.onChange}
                  className={cn(
                    gridVariants({ columns: gridCols }),
                    customClass,
                  )}
                  disabled={disabled}
                >
                  {options.map((option) => {
                    const isSelected = field.value === option.value;
                    const isOptionDisabled = disabled || option.disabled;
                    const radioClasses = cn(
                      "border-input text-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 shadow-xs aspect-square size-4 shrink-0 rounded-full border outline-none transition-[color,box-shadow] focus-visible:ring disabled:cursor-not-allowed disabled:opacity-50",
                      isSelected && "border-primary",
                      radioClassName,
                    );

                    return (
                      <FieldLabel
                        key={option.value}
                        htmlFor={option.value}
                        className={cn(
                          radioFieldVariants({
                            size: effectiveSize,
                            selected: isSelected,
                            disabled: isOptionDisabled,
                          }),
                          optionClassName,
                        )}
                      >
                        <Field orientation="horizontal">
                          <FieldContent
                            className={cn(
                              "flex flex-col items-center justify-center gap-8 text-center",
                              effectiveSize === "large" && "py-3",
                              effectiveSize === "compact" &&
                              "flex-row items-center justify-between gap-4 px-4",
                            )}
                          >
                            {option.image && effectiveSize !== "compact" && (
                              <div
                                className={cn(
                                  "relative",
                                  option.height
                                    ? `h-[${option.height}px]`
                                    : "h-[100px]",
                                  option.width
                                    ? `w-[${option.width}px]`
                                    : "w-[100px]",
                                  imageClassName,
                                )}
                              >
                                <Image
                                  src={option.image}
                                  alt={option.label}
                                  width={option.width || 100}
                                  height={option.height || 100}
                                  className="object-contain"
                                />
                              </div>
                            )}
                            <div
                              className={cn(
                                "absolute bottom-4 flex flex-col items-center gap-2",
                                effectiveSize === "compact" &&
                                "flex-1 flex-row items-center gap-3",
                              )}
                            >
                              <FieldTitle
                                className={cn(
                                  "flex w-full items-center justify-center px-4 text-center font-normal",
                                  effectiveSize === "large" &&
                                  "absolute inset-x-0 bottom-5",
                                  effectiveSize === "compact" &&
                                  "flex-1 px-0 text-left",
                                  labelClassName,
                                )}
                              >
                                {option.label}
                              </FieldTitle>
                              {option.description &&
                                effectiveSize !== "compact" && (
                                  <p className="px-2 text-center text-xs text-gray-500">
                                    {option.description}
                                  </p>
                                )}
                            </div>
                            {effectiveSize === "compact" && (
                              <RadioGroupPrimitive.Item
                                value={option.value}
                                id={option.value}
                                className={radioClasses}
                                disabled={isOptionDisabled}
                              >
                                <RadioGroupPrimitive.Indicator
                                  className="relative flex items-center justify-center"
                                >
                                  <CircleIcon className="fill-primary absolute left-1/2 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2" />
                                </RadioGroupPrimitive.Indicator>
                              </RadioGroupPrimitive.Item>
                            )}
                          </FieldContent>
                          {effectiveSize !== "compact" && (
                            <div className="absolute right-2 top-2">
                              <RadioGroupPrimitive.Item
                                value={option.value}
                                id={option.value}
                                className={radioClasses}
                                disabled={isOptionDisabled}
                              >
                                <RadioGroupPrimitive.Indicator
                                  className="relative flex items-center justify-center"
                                >
                                  <CircleIcon className="fill-primary absolute left-1/2 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2" />
                                </RadioGroupPrimitive.Indicator>
                              </RadioGroupPrimitive.Item>
                            </div>
                          )}
                        </Field>
                      </FieldLabel>
                    );
                  })}
                </RadioGroupPrimitive.Root>
              </FieldSet>
            </FieldGroup>
          </FormControl>
        </FormItem>
      )}
    />
  );
}
