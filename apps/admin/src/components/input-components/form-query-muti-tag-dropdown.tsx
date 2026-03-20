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

import { QueryMultiTagSelectDropdown } from "@/components/input-components/query-multi-tag-select-dropdown";
import type { SearchableDropdownOption } from "@/components/input-components/searchable-dropdown";
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
  renderDropdownItem?: (option: SearchableDropdownOption) => React.ReactNode;
  onValueChanged?: (options: SearchableDropdownOption[]) => void;
  searchPlaceholder?: string;
  countSuffix?: string;
  isSearchLoading?: boolean;
  searchTerm?: string;
  onSearchTerm?: (value: string) => void;
  disabled?: boolean;
  searchOuterClassName?: string;
  notFoundText?: string;
}

export function FormQueryMultiTagDropdown<
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
  isSearchLoading,
  searchTerm,
  onSearchTerm,
  disabled,
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
            <QueryMultiTagSelectDropdown
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
              isSearchLoading={isSearchLoading}
              searchTerm={searchTerm}
              onSearchTerm={onSearchTerm}
              disabled={disabled}
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
