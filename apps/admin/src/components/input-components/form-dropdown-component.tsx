"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@cf/ui/components/form";
import * as React from "react";
import type { Control, FieldPath, FieldValues } from "react-hook-form";

import DropdownComponent from "@/components/input-components/dropdown-component";
import type { OptionProps } from "@/types/common.types";

interface FormSelectInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  name: TName;
  control: Control<TFieldValues>;
  label?: string;
  placeholder?: string;
  options: OptionProps[];
  required?: boolean;
  className?: string;
  contentClassName?: string;
  renderLabel?: (option: OptionProps) => React.ReactNode;
  renderValue?: (option?: OptionProps) => React.ReactNode;
  onValueChanged?: (option?: OptionProps) => void;
}

export function FormDropdownComponent<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  name,
  control,
  label,
  options,
  required,
  className,
  contentClassName,
  placeholder,
  renderLabel,
  renderValue,
  onValueChanged,
}: FormSelectInputProps<TFieldValues, TName>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-1">
          {label && (
            <FormLabel>
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </FormLabel>
          )}
          <FormControl>
            <DropdownComponent
              className={className}
              defaultValue={field.value || ""}
              placeholder={placeholder}
              options={options}
              onValueChange={(value) => {
                field.onChange(value);
                onValueChanged?.(options.find((o) => o.value === value));
              }}
              contentClassName={contentClassName}
              renderLabel={renderLabel}
              renderValue={renderValue}
            />
          </FormControl>
          <FormMessage className="text-xs font-normal" />
        </FormItem>
      )}
    />
  );
}
