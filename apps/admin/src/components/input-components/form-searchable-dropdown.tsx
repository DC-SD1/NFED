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

import { SearchableDropdown } from "@/components/input-components/searchable-dropdown";
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
  renderDropdownItem?: (option: OptionProps) => React.ReactNode;
  searchPlaceholder?: string;
  onValueChanged?: (option: OptionProps) => void;
  disabled?: boolean;
  searchOuterClassName?: string;
}

export function FormSearchableDropdown<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  name,
  control,
  label,
  options,
  required,
  className,
  placeholder,
  renderDropdownItem,
  searchPlaceholder,
  onValueChanged,
  disabled,
  searchOuterClassName,
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
              {required && <span className="ml-1 text-destructive">*</span>}
            </FormLabel>
          )}
          <FormControl>
            <SearchableDropdown
              className={className}
              defaultValue={field.value || ""}
              placeholder={placeholder}
              searchPlaceholder={searchPlaceholder}
              options={options}
              onValueChange={(option) => {
                field.onChange(option.value);
                onValueChanged?.(option);
              }}
              disabled={disabled}
              renderDropdownItem={renderDropdownItem}
              searchOuterClassName={searchOuterClassName}
            />
          </FormControl>
          <FormMessage className="text-xs font-normal" />
        </FormItem>
      )}
    />
  );
}
