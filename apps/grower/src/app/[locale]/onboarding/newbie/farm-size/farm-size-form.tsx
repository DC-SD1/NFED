"use client"

import { ControlledInput } from "@cf/ui/components/controlled-input"
import { ControlledSelect } from "@cf/ui/components/controlled-select"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { StepNavigation } from "@/components/auth/step-navigation"

const farmSizeSchema = z.object({
  size: z.string().min(1, "Please enter farm size"),
  unit: z.enum(["acres", "hectares", "plots", "sqmeters"])
})

type FarmSizeData = z.infer<typeof farmSizeSchema>

const unitOptions = [
  { value: "acres", label: "Acres" },
  { value: "hectares", label: "Hectares" },
  { value: "plots", label: "Plots" },
  { value: "sqmeters", label: "Square meters" },
]

const sizeGuides = [
  { size: "Small backyard", example: "< 0.25 acres or < 1,000 sq meters" },
  { size: "Large backyard", example: "0.25 - 1 acre or 1,000 - 4,000 sq meters" },
  { size: "Small farm", example: "1 - 5 acres or 0.4 - 2 hectares" },
  { size: "Medium farm", example: "5 - 20 acres or 2 - 8 hectares" },
]

export function FarmSizeForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  
  const {
    control,
    handleSubmit
  } = useForm<FarmSizeData>({
    resolver: zodResolver(farmSizeSchema),
    defaultValues: {
      size: "",
      unit: "acres"
    }
  })

  const onSubmit = async (data: FarmSizeData) => {
    setIsLoading(true)
    
    // TODO: Save to user profile
    console.log("Farm size:", data)
    
    // Navigate to next step
    router.push("/onboarding/newbie/learning-preference")
  }

  const handleBack = () => {
    router.push("/onboarding/newbie/crop-interest")
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <ControlledInput
            name="size"
            control={control}
            type="number"
            label="Farm size"
            placeholder="Enter size"
            step="0.01"
          />
          
          <ControlledSelect
            name="unit"
            control={control}
            label="Unit"
            options={unitOptions}
          />
        </div>
        
        <div className="space-y-2 rounded-lg bg-gray-50 p-4">
          <p className="text-sm font-medium text-gray-700">Size reference guide:</p>
          <div className="space-y-1">
            {sizeGuides.map((guide, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-gray-600">{guide.size}:</span>
                <span className="text-gray-500">{guide.example}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm text-blue-800">
            Don&apos;t worry if you&apos;re not sure about the exact size. You can update this later!
          </p>
        </div>
      </div>
      
      <StepNavigation
        onBack={handleBack}
        isFirstStep={false}
        isLoading={isLoading}
      />
    </form>
  )
}