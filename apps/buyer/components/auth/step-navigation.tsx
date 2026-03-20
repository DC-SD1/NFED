"use client"

import { Button } from "@cf/ui/components/button"
import { cn } from "@cf/ui/utils/cn"
import { ArrowLeft, ArrowRight } from "lucide-react"

interface StepNavigationProps {
  onBack?: () => void
  onNext?: () => void
  onSkip?: () => void
  isFirstStep?: boolean
  isLastStep?: boolean
  isLoading?: boolean
  isDisabled?: boolean
  backLabel?: string
  nextLabel?: string
  skipLabel?: string
  showSkip?: boolean
  className?: string
  nextButtonType?: "button" | "submit"
}

export function StepNavigation({
  onBack,
  onNext,
  onSkip,
  isFirstStep = false,
  isLastStep = false,
  isLoading = false,
  isDisabled = false,
  backLabel = "Back",
  nextLabel = "Next",
  skipLabel = "Skip",
  showSkip = false,
  className,
  nextButtonType = "button"
}: StepNavigationProps) {
  return (
    <div className={cn(
      "flex items-center justify-between gap-4",
      className
    )}>
      <div className="flex items-center gap-2">
        {!isFirstStep && (
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isLoading}
            className="gap-2"
          >
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">{backLabel}</span>
          </Button>
        )}
        
        {showSkip && onSkip && (
          <Button
            type="button"
            variant="ghost"
            onClick={onSkip}
            disabled={isLoading}
            className="text-gray-600 hover:text-gray-900"
          >
            {skipLabel}
          </Button>
        )}
      </div>
      
      <Button
        type={nextButtonType}
        onClick={nextButtonType === "button" ? onNext : undefined}
        disabled={isLoading || isDisabled}
        className="ml-auto gap-2"
      >
        <span>{isLastStep ? "Complete" : nextLabel}</span>
        {!isLastStep && <ArrowRight className="size-4" />}
      </Button>
    </div>
  )
}