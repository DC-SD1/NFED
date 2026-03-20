"use client"

import { Button } from "@cf/ui/components/button"
import { ControlledCheckbox } from "@cf/ui/components/controlled-checkbox"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { type MarketingFormData,marketingSchema } from "@/lib/schemas/sign-up"

interface MarketingFormProps {
  onSubmit: (data: MarketingFormData) => void
  isLoading?: boolean
  onSkip?: () => void
}

const marketingOptions = [
  { value: "socialMedia", label: "Social Media (Facebook, Instagram, Twitter)" },
  { value: "googleSearch", label: "Google Search" },
  { value: "friendReferral", label: "Friend or Family Referral" },
  { value: "youtube", label: "YouTube" },
  { value: "blogArticle", label: "Blog or Article" },
  { value: "news", label: "News (TV, Radio, Newspaper)" },
  { value: "event", label: "Event or Conference" },
  { value: "other", label: "Other" },
]

export function MarketingForm({ onSubmit, isLoading, onSkip }: MarketingFormProps) {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<MarketingFormData>({
    resolver: zodResolver(marketingSchema),
    defaultValues: {
      channels: []
    }
  })

  const selectedChannels = watch("channels")

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Select all that apply:
        </p>
        
        <div className="space-y-3">
          {marketingOptions.map((option) => (
            <ControlledCheckbox
              key={option.value}
              control={control}
              name="channels"
              value={option.value}
              label={option.label}
            />
          ))}
        </div>
        
        {errors.channels && (
          <p className="text-sm text-red-500">{errors.channels?.message || 'Please select at least one option'}</p>
        )}
      </div>
      
      <div className="space-y-3">
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || selectedChannels.length === 0}
        >
          {isLoading ? "Saving..." : "Continue"}
        </Button>
        
        {onSkip && (
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={onSkip}
            disabled={isLoading}
          >
            Skip this step
          </Button>
        )}
      </div>
    </form>
  )
}