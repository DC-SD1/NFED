"use client";

import { Eye, EyeOff } from "lucide-react";
import { forwardRef, useState } from "react";

import { cn } from "../utils/cn";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";

interface PasswordInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: boolean;
  description?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, label, error, description, id, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId =
      id ?? `password-${Math.random().toString(36).substring(2, 11)}`;

    return (
      <div className="space-y-2">
        {label && (
          <Label
            htmlFor={inputId}
            className="text-sm font-medium text-gray-700"
          >
            {label}
          </Label>
        )}
        <div className="relative">
          <Input
            {...props}
            ref={ref}
            id={inputId}
            type={showPassword ? "text" : "password"}
            className={cn(
              "bg-muted h-12 rounded-xl border-0 pr-12 text-gray-900 placeholder:text-gray-500",
              error
                ? "ring-1 ring-red-500 focus-visible:ring-1 focus-visible:ring-red-500"
                : "focus-visible:ring-primary focus-visible:ring-1",
              className,
            )}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-3 top-1/2 h-auto -translate-y-1/2 p-0 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="size-5 text-gray-500" />
            ) : (
              <Eye className="size-5 text-gray-500" />
            )}
          </Button>
        </div>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    );
  },
);

PasswordInput.displayName = "PasswordInput";
