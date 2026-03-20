"use client"

import { ControlledCheckbox } from "@cf/ui/components/controlled-checkbox"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { StepNavigation } from "@/components/auth/step-navigation"

const technologySchema = z.object({
  technologies: z.array(z.string()).optional()
})

type TechnologyData = z.infer<typeof technologySchema>

const technologyOptions = [
  {
    category: "Mobile & Apps",
    items: [
      { value: "smartphone", label: "Smartphone for farming" },
      { value: "farming_apps", label: "Farming mobile apps" },
      { value: "weather_apps", label: "Weather forecast apps" },
      { value: "market_apps", label: "Market price apps" },
    ]
  },
  {
    category: "Digital Services",
    items: [
      { value: "mobile_money", label: "Mobile money" },
      { value: "online_banking", label: "Online banking" },
      { value: "ecommerce", label: "E-commerce platforms" },
      { value: "social_media", label: "Social media for business" },
    ]
  },
  {
    category: "Farm Technology",
    items: [
      { value: "gps", label: "GPS/Location services" },
      { value: "drones", label: "Drones" },
      { value: "sensors", label: "Soil/weather sensors" },
      { value: "smart_irrigation", label: "Smart irrigation" },
    ]
  },
  {
    category: "Information Access",
    items: [
      { value: "internet", label: "Internet access" },
      { value: "youtube", label: "YouTube for learning" },
      { value: "online_courses", label: "Online farming courses" },
      { value: "whatsapp_groups", label: "WhatsApp farming groups" },
    ]
  },
]

export function TechnologyUseForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  
  const {
    control,
    handleSubmit,
    watch
  } = useForm<TechnologyData>({
    resolver: zodResolver(technologySchema),
    defaultValues: {
      technologies: []
    }
  })

  const selectedTechnologies = watch("technologies") || []

  const onSubmit = async (data: TechnologyData) => {
    setIsLoading(true)
    
    // TODO: Save to user profile
    console.log("Technologies:", data)
    
    // Navigate to next step
    router.push("/onboarding/experienced/goals")
  }

  const handleBack = () => {
    router.push("/onboarding/experienced/market-access")
  }

  const handleSkip = () => {
    router.push("/onboarding/experienced/goals")
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-6">
        {technologyOptions.map((category) => (
          <div key={category.category} className="space-y-3">
            <h3 className="font-medium text-gray-900">{category.category}</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {category.items.map((item) => (
                <ControlledCheckbox
                  key={item.value}
                  control={control}
                  name="technologies"
                  value={item.value}
                  label={item.label}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="rounded-lg bg-gray-50 p-4">
        <p className="text-sm text-gray-700">
          {selectedTechnologies.length > 0 
            ? `You use ${selectedTechnologies.length} technolog${selectedTechnologies.length > 1 ? 'ies' : 'y'}` 
            : "Select technologies you currently use in farming"}
        </p>
      </div>
      
      <StepNavigation
        onBack={handleBack}
        onSkip={handleSkip}
        showSkip={true}
        skipLabel="I don&apos;t use technology"
        isFirstStep={false}
        isLoading={isLoading}
      />
    </form>
  )
}