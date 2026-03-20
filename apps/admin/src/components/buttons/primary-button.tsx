"use client";

import { Button } from "@cf/ui";
import { Loader2 } from "lucide-react";

interface Props {
  onClick?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  buttonContent?: string | React.ReactNode;
  variant?:
    | "default"
    | "secondary"
    | "outline"
    | "ghost"
    | "link"
    | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  type?: "button" | "submit" | "reset";
}

export default function PrimaryButton({
  onClick,
  isLoading,
  disabled,
  className,
  buttonContent,
  variant = "default",
  size = "default",
  type = "button",
}: Props) {
  return (
    <Button
      type={type}
      variant={variant}
      onClick={onClick}
      size={size}
      disabled={disabled || isLoading}
      className={className}
    >
      {isLoading && <Loader2 className="size-4 animate-spin" />}
      {buttonContent}
    </Button>
  );
}
