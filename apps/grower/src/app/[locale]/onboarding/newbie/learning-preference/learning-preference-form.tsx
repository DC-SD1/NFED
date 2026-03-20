"use client"

import { ControlledCheckbox } from "@cf/ui/components/controlled-checkbox"
import { zodResolver } from "@hookform/resolvers/zod"
import { BookOpen, Headphones,Users, Video } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { StepNavigation } from "@/components/auth/step-navigation"

const learningSchema = z.object({
  preferences: z.array(z.string()).min(1, "Please select at least one learning preference")
})

type LearningData = z.infer<typeof learningSchema>

const learningOptions = [
  {
    value: "videos",
    label: "Video tutorials",
    description: "Watch step-by-step farming guides",
    icon: Video,
  },
  {
    value: "articles",
    label: "Articles & guides",
    description: "Read detailed farming instructions",
    icon: BookOpen,
  },
  {
    value: "community",
    label: "Community forums",
    description: "Learn from other farmers' experiences",
    icon: Users,
  },
  {
    value: "podcasts",
    label: "Audio content",
    description: "Listen to farming podcasts and tips",
    icon: Headphones,
  },
]

export function LearningPreferenceForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<LearningData>({
    resolver: zodResolver(learningSchema),
    defaultValues: {
      preferences: []
    }
  })

  const selectedPreferences = watch("preferences")

  const onSubmit = async (data: LearningData) => {
    setIsLoading(true)
    
    // TODO: Save to user profile
    console.log("Learning preferences:", data)
    
    // Navigate to next step
    router.push("/onboarding/newbie/goals")
  }

  const handleBack = () => {
    router.push("/onboarding/newbie/farm-size")
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        {learningOptions.map((option) => {
          const Icon = option.icon
          const isSelected = selectedPreferences.includes(option.value)
          
          return (
            <label
              key={option.value}
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
                name="preferences"
                value={option.value}
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
                    {option.label}
                  </p>
                  <p className="text-sm text-gray-500">
                    {option.description}
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
      
      {errors.preferences && (
        <p className="text-sm text-red-500">{errors.preferences.message}</p>
      )}
      
      <StepNavigation
        onBack={handleBack}
        isFirstStep={false}
        isLoading={isLoading}
        isDisabled={selectedPreferences.length === 0}
      />
    </form>
  )
}