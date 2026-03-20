"use client"

import { ControlledCheckbox } from "@cf/ui/components/controlled-checkbox"
import { zodResolver } from "@hookform/resolvers/zod"
import { BookOpen,Bug, Cloud, DollarSign, ShoppingCart, Wrench } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { StepNavigation } from "@/components/auth/step-navigation"

const challengesSchema = z.object({
  challenges: z.array(z.string()).min(1, "Please select at least one challenge")
})

type ChallengesData = z.infer<typeof challengesSchema>

const challengeCategories = [
  {
    category: "Financial",
    icon: DollarSign,
    challenges: [
      { value: "funding", label: "Access to funding/credit" },
      { value: "high_costs", label: "High input costs" },
      { value: "price_fluctuation", label: "Price fluctuations" },
    ]
  },
  {
    category: "Environmental",
    icon: Cloud,
    challenges: [
      { value: "weather", label: "Unpredictable weather" },
      { value: "soil_quality", label: "Poor soil quality" },
      { value: "water_access", label: "Water access/irrigation" },
    ]
  },
  {
    category: "Pests & Diseases",
    icon: Bug,
    challenges: [
      { value: "pest_control", label: "Pest management" },
      { value: "disease_control", label: "Disease control" },
      { value: "crop_loss", label: "High crop losses" },
    ]
  },
  {
    category: "Market Access",
    icon: ShoppingCart,
    challenges: [
      { value: "buyers", label: "Finding reliable buyers" },
      { value: "transport", label: "Transportation costs" },
      { value: "storage", label: "Storage facilities" },
    ]
  },
  {
    category: "Technical",
    icon: Wrench,
    challenges: [
      { value: "equipment", label: "Equipment/machinery" },
      { value: "labor", label: "Skilled labor shortage" },
      { value: "technology", label: "Technology adoption" },
    ]
  },
  {
    category: "Knowledge",
    icon: BookOpen,
    challenges: [
      { value: "techniques", label: "Modern farming techniques" },
      { value: "market_info", label: "Market information" },
      { value: "best_practices", label: "Best practices knowledge" },
    ]
  },
]

export function ChallengesForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<ChallengesData>({
    resolver: zodResolver(challengesSchema),
    defaultValues: {
      challenges: []
    }
  })

  const selectedChallenges = watch("challenges")

  const onSubmit = async (data: ChallengesData) => {
    setIsLoading(true)
    
    // TODO: Save to user profile
    console.log("Challenges:", data)
    
    // Navigate to next step
    router.push("/onboarding/experienced/equipment")
  }

  const handleBack = () => {
    router.push("/onboarding/experienced/farming-methods")
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-6">
        {challengeCategories.map((category) => {
          const Icon = category.icon
          return (
            <div key={category.category} className="space-y-3">
              <div className="flex items-center gap-2">
                <Icon className="size-5 text-gray-600" />
                <h3 className="font-medium text-gray-900">{category.category}</h3>
              </div>
              <div className="space-y-2">
                {category.challenges.map((challenge) => (
                  <div key={challenge.value} className="rounded-lg border p-3 hover:bg-gray-50">
                    <ControlledCheckbox
                      control={control}
                      name="challenges"
                      value={challenge.value}
                      label={challenge.label}
                    />
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
      
      {errors.challenges && (
        <p className="text-sm text-red-500">{errors.challenges.message}</p>
      )}
      
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <p className="text-sm text-blue-800">
          {selectedChallenges.length > 0 
            ? `You've selected ${selectedChallenges.length} challenge${selectedChallenges.length > 1 ? 's' : ''}. We'll provide targeted support.` 
            : "Select the main challenges you face in farming"}
        </p>
      </div>
      
      <StepNavigation
        onBack={handleBack}
        isFirstStep={false}
        isLoading={isLoading}
        isDisabled={selectedChallenges.length === 0}
      />
    </form>
  )
}