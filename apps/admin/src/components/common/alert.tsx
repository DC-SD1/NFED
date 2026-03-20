"use client";

import { cn } from "@cf/ui";
import { AlertCircle, CheckCircle2, Rocket, X } from "lucide-react";

interface AlertProps {
  variant?: "info" | "error" | "success";
  title?: string;
  description?: string;
  className?: string;
  onClose?: () => void;
}

export function Alert({
  variant = "info",
  title,
  description,
  className,
  onClose,
}: AlertProps) {
  return (
    <div
      className={cn(
        "relative flex w-full items-center gap-3 rounded-xl p-4 text-sm lg:w-[36rem]",
        {
          "bg-slate-800 text-slate-200 shadow-[0_0_15px_rgba(100,116,139,0.5)]":
            variant === "info",
          "bg-red-50 text-red-600 shadow-[0_0_15px_rgba(239,68,68,0.25)]":
            variant === "error",
          "bg-[#161D14] text-white shadow-[0_0_15px_rgba(34,197,94,0.25)]":
            variant === "success",
        },
        className,
      )}
    >
      <div className="">
        {variant === "info" && <Rocket className="size-5" />}
        {variant === "error" && <AlertCircle className="size-5" />}
        {variant === "success" && <CheckCircle2 className="size-5" />}
      </div>
      <div className="mb-1 flex-1">
        {title && <h5 className="font-medium">{title}</h5>}
        {description && <p className="mt-1 opacity-90">{description}</p>}
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className={cn(
            "absolute inset-y-0 right-2 rounded-full p-1 transition-colors",
            {
              "hover:bg-slate-600/5": variant === "info",
              "hover:bg-red-600/5": variant === "error",
              "hover:bg-green-600/5": variant === "success",
            },
          )}
          aria-label="Close"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
