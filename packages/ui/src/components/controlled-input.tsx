"use client";

import * as React from "react";
import {
  Controller,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

import { cn } from "../utils/cn";
import { Input, type InputProps } from "./input";
import { Label } from "./label";

export interface ControlledInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<ControllerProps<TFieldValues, TName>, "render">,
    Omit<InputProps, "name" | "defaultValue"> {
  label?: string;
  description?: string;
  containerClassName?: string;
  labelClassName?: string;
  descriptionClassName?: string;
  errorClassName?: string;
}

export function ControlledInput<
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
  ...props
}: ControlledInputProps<TFieldValues, TName>) {
  const inputId = id ?? name;

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
              htmlFor={inputId}
              className={cn(error && "text-destructive", labelClassName)}
            >
              {label}
              {rules?.required && (
                <span className="ml-1 text-destructive">*</span>
              )}
            </Label>
          )}
          <Input
            {...field}
            {...props}
            id={inputId}
            className={cn(
              "bg-primary-light",
              error && "border-destructive focus-visible:ring-destructive",
              className,
            )}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={
              error
                ? `${inputId}-error`
                : description
                  ? `${inputId}-description`
                  : undefined
            }
          />
          {description && !error && (
            <p
              id={`${inputId}-description`}
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
              id={`${inputId}-error`}
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
