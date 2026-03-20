"use client";

import * as React from "react";
import {
  type FieldPath,
  type FieldValues,
  useFormContext,
} from "react-hook-form";

import { cn } from "../utils/cn";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form";
import { Input, type InputProps } from "./input";

export interface FormInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<InputProps, "name"> {
  name: TName;
  label?: string;
  description?: string;
  containerClassName?: string;
  labelClassName?: string;
  descriptionClassName?: string;
  required?: boolean;
}

export function FormInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  label,
  description,
  containerClassName,
  labelClassName,
  descriptionClassName,
  required,
  className,
  ...props
}: FormInputProps<TFieldValues, TName>) {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("space-y-1", containerClassName)}>
          {label && (
            <FormLabel className={labelClassName}>
              {label}
              {required && <span className="ml-1 text-destructive">*</span>}
            </FormLabel>
          )}
          <FormControl>
            <Input
              {...field}
              {...props}
              className={cn(
                "h-10 border-none bg-primary-light pr-12 placeholder:text-[#525C4E]",
                className,
              )}
            />
          </FormControl>
          {description && (
            <FormDescription className={descriptionClassName}>
              {description}
            </FormDescription>
          )}
          <FormMessage className="text-xs font-normal" />
        </FormItem>
      )}
    />
  );
}
