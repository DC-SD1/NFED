"use client";

import * as React from "react";
import {
  Controller,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

import { cn } from "../utils/cn";
import { Label } from "./label";
import { RadioGroup, RadioGroupItem } from "./radio-group";

export interface RadioOption {
  label: string;
  value: string;
  disabled?: boolean;
  description?: string;
}

export interface ControlledRadioGroupProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<ControllerProps<TFieldValues, TName>, "render"> {
  label?: string;
  description?: string;
  options: RadioOption[];
  containerClassName?: string;
  labelClassName?: string;
  descriptionClassName?: string;
  errorClassName?: string;
  radioGroupClassName?: string;
  orientation?: "horizontal" | "vertical";
  disabled?: boolean;
}

export function ControlledRadioGroup<
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
  options,
  containerClassName,
  labelClassName,
  descriptionClassName,
  errorClassName,
  radioGroupClassName,
  orientation = "vertical",
  disabled,
}: ControlledRadioGroupProps<TFieldValues, TName>) {
  const radioGroupId = name;

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue}
      rules={rules}
      shouldUnregister={shouldUnregister}
      render={({ field, fieldState: { error } }) => (
        <div className={cn("space-y-3", containerClassName)}>
          {label && (
            <Label className={cn(error && "text-destructive", labelClassName)}>
              {label}
              {rules?.required && (
                <span className="ml-1 text-destructive">*</span>
              )}
            </Label>
          )}
          {description && !error && (
            <p
              id={`${radioGroupId}-description`}
              className={cn(
                "text-sm text-muted-foreground",
                descriptionClassName,
              )}
            >
              {description}
            </p>
          )}
          <RadioGroup
            {...field}
            value={field.value}
            onValueChange={field.onChange}
            disabled={disabled}
            className={cn(
              orientation === "horizontal"
                ? "flex flex-row gap-4"
                : "grid gap-2",
              radioGroupClassName,
            )}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={
              error
                ? `${radioGroupId}-error`
                : description
                  ? `${radioGroupId}-description`
                  : undefined
            }
          >
            {options.map((option) => (
              <div key={option.value} className="flex items-start space-x-3">
                <RadioGroupItem
                  value={option.value}
                  id={`${radioGroupId}-${option.value}`}
                  disabled={option.disabled}
                  className={cn("mt-0.5", error && "border-destructive")}
                  label={option.label}
                  selected={field.value === option.value}
                />
                <div className="space-y-1">
                  <Label
                    htmlFor={`${radioGroupId}-${option.value}`}
                    className={cn(
                      "font-normal cursor-pointer",
                      (disabled ?? option.disabled) &&
                        "cursor-not-allowed opacity-70",
                    )}
                  >
                    {option.label}
                  </Label>
                  {option.description && (
                    <p className="text-sm text-muted-foreground">
                      {option.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </RadioGroup>
          {error && (
            <p
              id={`${radioGroupId}-error`}
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
      )}
    />
  );
}
