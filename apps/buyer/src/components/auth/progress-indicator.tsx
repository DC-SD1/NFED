"use client";

import { cn } from "@cf/ui/utils/cn";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
  showStepNumbers?: boolean;
}

export function ProgressIndicator({
  currentStep,
  totalSteps,
  className,
  showStepNumbers = false,
}: ProgressIndicatorProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div
      className={cn(
        "mx-auto w-full max-w-md pt-4 text-center lg:pb-7",
        className,
      )}
    >
      {showStepNumbers && (
        <div className="flex justify-between text-sm text-gray-600">
          <span>
            Step {currentStep} of {totalSteps}
          </span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
      )}

      <div className="flex gap-1">
        {Array.from({ length: totalSteps }).map((_, idx) => (
          <div
            key={idx}
            className={cn(
              "h-1 flex-1 rounded-sm",
              idx < currentStep ? "bg-primary" : "bg-gray-200",
            )}
          />
        ))}
      </div>
    </div>
  );
}
