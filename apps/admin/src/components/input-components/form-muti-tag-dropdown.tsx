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

import { MultiTagSelectDropdown } from "@/components/input-components/multi-tag-select-dropdown";
import type { SearchableDropdownOption } from "@/components/input-components/searchable-dropdown";

interface Option {
  label: string;
  value: string;

  [p: string]: any;
}

interface FormSelectInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  name: TName;
  control: Control<TFieldValues>;
  label?: string;
  placeholder?: string;
  options: Option[];
  required?: boolean;
  className?: string;
  renderDropdownItem?: (option: SearchableDropdownOption) => React.ReactNode;
  onValueChanged?: (options: SearchableDropdownOption[]) => void;
  searchPlaceholder?: string;
  countSuffix?: string;
  searchOuterClassName?: string;
  notFoundText?: string;
}

export function FormMultiTagDropdown<
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
  countSuffix,
  searchOuterClassName,
  notFoundText,
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
            <MultiTagSelectDropdown
              className={className}
              defaultValues={field.value || []}
              placeholder={placeholder}
              searchPlaceholder={searchPlaceholder}
              options={options}
              onValueChange={(options) => {
                field.onChange(options.map((obj) => obj.value));
                onValueChanged?.(options);
              }}
              renderDropdownItem={renderDropdownItem}
              countSuffix={countSuffix}
              searchOuterClassName={searchOuterClassName}
              notFoundText={notFoundText}
            />
          </FormControl>
          <FormMessage className="text-xs font-normal" />
        </FormItem>
      )}
    />
  );
}
