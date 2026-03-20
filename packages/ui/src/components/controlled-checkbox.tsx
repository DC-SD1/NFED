"use client";

import * as React from "react";
import {
  Controller,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

import { cn } from "../utils/cn";
import { Checkbox, type CheckboxProps } from "./checkbox";
import { Label } from "./label";

export interface ControlledCheckboxProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<ControllerProps<TFieldValues, TName>, "render">,
    Omit<
      CheckboxProps,
      "name" | "defaultValue" | "checked" | "onCheckedChange"
    > {
  label?: string;
  description?: string;
  containerClassName?: string;
  labelClassName?: string;
  descriptionClassName?: string;
  errorClassName?: string;
  value: string;
}

export function ControlledCheckbox<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  control,
  defaultValue,
  rules,
  shouldUnregister,
  label,
  description,
  containerClassName,
  labelClassName,
  descriptionClassName,
  errorClassName,
  className,
  id,
  disabled,
  value,
  ...props
}: ControlledCheckboxProps<TFieldValues, TName>) {
  const checkboxId = id ?? `${name}-${value}`;

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue}
      rules={rules}
      shouldUnregister={shouldUnregister}
      render={({ field, fieldState: { error } }) => {
        const currentValues = Array.isArray(field.value)
          ? (field.value as string[])
          : [];
        const isChecked = currentValues.includes(value);

        const toggleValue = (checked: boolean) => {
          const newValue = checked
            ? [...currentValues, value]
            : currentValues.filter((v) => v !== value);
          field.onChange(newValue);
        };

        return (
          <div className={cn("space-y-2", containerClassName)}>
            <div className="flex items-center space-x-3 rounded-2xl border border-gray-300 bg-white p-4 transition-colors hover:bg-gray-50">
              <Checkbox
                {...props}
                id={checkboxId}
                checked={isChecked}
                onCheckedChange={toggleValue}
                disabled={disabled}
                className={cn(
                  "mt-0.5 border-gray-300",
                  error && "border-destructive",
                  className,
                )}
                aria-invalid={error ? "true" : "false"}
                aria-describedby={
                  error
                    ? `${checkboxId}-error`
                    : description
                      ? `${checkboxId}-description`
                      : undefined
                }
                ref={field.ref}
              />
              <div className="space-y-1">
                {label && (
                  <Label
                    htmlFor={checkboxId}
                    className={cn(
                      "cursor-pointer font-normal",
                      disabled && "cursor-not-allowed opacity-70",
                      error && "text-destructive",
                      labelClassName,
                    )}
                  >
                    {label}
                    {rules?.required && (
                      <span className="ml-1 text-destructive">*</span>
                    )}
                  </Label>
                )}
                {description && !error && (
                  <p
                    id={`${checkboxId}-description`}
                    className={cn(
                      "text-sm text-muted-foreground",
                      descriptionClassName,
                    )}
                  >
                    {description}
                  </p>
                )}
                {error && (
                  <p
                    id={`${checkboxId}-error`}
                    className={cn(
                      "text-sm font-medium text-destructive",
                      errorClassName,
                    )}
                    role="alert"
                  >
                    {error.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      }}
    />
  );
}
