"use client"

import { ControlledCheckbox } from "@cf/ui/components/controlled-checkbox"
import { zodResolver } from "@hookform/resolvers/zod"
import { Building, Globe, Phone,Store, Truck, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { StepNavigation } from "@/components/auth/step-navigation"

const marketAccessSchema = z.object({
  channels: z.array(z.string()).min(1, "Please select at least one sales channel")
})

type MarketAccessData = z.infer<typeof marketAccessSchema>

const channelOptions = [
  {
    value: "local_market",
    label: "Local markets",
    description: "Direct sales at local/farmers markets",
    icon: Store,
  },
  {
    value: "middlemen",
    label: "Middlemen/Aggregators",
    description: "Selling through intermediaries",
    icon: Users,
  },
  {
    value: "retailers",
    label: "Retailers",
    description: "Direct to shops and supermarkets",
    icon: Building,
  },
  {
    value: "export",
    label: "Export markets",
    description: "International buyers",
    icon: Globe,
  },
  {
    value: "farmgate",
    label: "Farm gate sales",
    description: "Buyers come to your farm",
    icon: Truck,
  },
  {
    value: "online",
    label: "Online/Digital platforms",
    description: "E-commerce and digital marketplaces",
    icon: Phone,
  },
]

export function MarketAccessForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<MarketAccessData>({
    resolver: zodResolver(marketAccessSchema),
    defaultValues: {
      channels: []
    }
  })

  const selectedChannels = watch("channels")

  const onSubmit = async (data: MarketAccessData) => {
    setIsLoading(true)
    
    // TODO: Save to user profile
    console.log("Market channels:", data)
    
    // Navigate to next step
    router.push("/onboarding/experienced/technology-use")
  }

  const handleBack = () => {
    router.push("/onboarding/experienced/equipment")
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-3">
        {channelOptions.map((channel) => {
          const Icon = channel.icon
          const isSelected = selectedChannels.includes(channel.value)
          
          return (
            <label
              key={channel.value}
              className={`
                relative flex cursor-pointer rounded-lg border p-4 transition-all
                ${isSelected 
                  ? 'border-primary bg-primary/5' 
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <ControlledCheckbox
                control={control}
                name="channels"
                value={channel.value}
                className="sr-only"
              />
              <div className="flex w-full items-start gap-3">
                <div className={`
                  flex size-10 items-center justify-center rounded-lg transition-colors
                  ${isSelected ? 'bg-primary text-white' : 'bg-gray-100'}
                `}>
                  <Icon className="size-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {channel.label}
                  </p>
                  <p className="text-sm text-gray-500">
                    {channel.description}
                  </p>
                </div>
                {isSelected && (
                  <div className="bg-primary flex size-5 items-center justify-center rounded-full text-white">
                    <svg className="size-3" fill="currentColor" viewBox="0 0 12 12">
                      <path d="M3.707 5.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 00-1.414-1.414L5 6.586 3.707 5.293z" />
                    </svg>
                  </div>
                )}
              </div>
            </label>
          )
        })}
      </div>
      
      {errors.channels && (
        <p className="text-sm text-red-500">{errors.channels.message}</p>
      )}
      
      <StepNavigation
        onBack={handleBack}
        isFirstStep={false}
        isLoading={isLoading}
        isDisabled={selectedChannels.length === 0}
      />
    </form>
  )
}