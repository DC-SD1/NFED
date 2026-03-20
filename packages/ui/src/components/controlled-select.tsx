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
import {
  Select,
  SelectContent,
  SelectItem,
  type SelectProps,
  SelectTrigger,
  SelectValue,
} from "./select";

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface ControlledSelectProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<ControllerProps<TFieldValues, TName>, "render">,
    Omit<SelectProps, "name" | "defaultValue"> {
  label?: string;
  description?: string;
  placeholder?: string;
  options: SelectOption[];
  containerClassName?: string;
  labelClassName?: string;
  descriptionClassName?: string;
  errorClassName?: string;
  triggerClassName?: string;
}

export function ControlledSelect<
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
  placeholder,
  options,
  containerClassName,
  labelClassName,
  descriptionClassName,
  errorClassName,
  triggerClassName,
  disabled,
  ...props
}: ControlledSelectProps<TFieldValues, TName>) {
  const selectId = name;

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue}
      rules={rules}
      shouldUnregister={shouldUnregister}
      render={({ field, fieldState: { error } }) => (
        <div className={cn("space-y-2", containerClassName)}>
          {label && (
            <Label
              htmlFor={selectId}
              className={cn(error && "text-destructive", labelClassName)}
            >
              {label}
              {rules?.required && (
                <span className="ml-1 text-destructive">*</span>
              )}
            </Label>
          )}
          <Select
            {...props}
            value={field.value}
            onValueChange={field.onChange}
            disabled={disabled}
          >
            <SelectTrigger
              id={selectId}
              className={cn(
                error && "border-destructive focus:ring-destructive",
                triggerClassName,
              )}
              aria-invalid={error ? "true" : "false"}
              aria-describedby={
                error
                  ? `${selectId}-error`
                  : description
                    ? `${selectId}-description`
                    : undefined
              }
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {description && !error && (
            <p
              id={`${selectId}-description`}
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
              id={`${selectId}-error`}
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
