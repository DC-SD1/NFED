"use client"

import { ControlledCheckbox } from "@cf/ui/components/controlled-checkbox"
import { zodResolver } from "@hookform/resolvers/zod"
import { Apple, Carrot, Leaf, Wheat } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { StepNavigation } from "@/components/auth/step-navigation"

const cropInterestSchema = z.object({
  crops: z.array(z.string()).min(1, "Please select at least one crop")
})

type CropInterestData = z.infer<typeof cropInterestSchema>

const cropCategories = [
  {
    category: "Vegetables",
    icon: Carrot,
    crops: [
      { value: "tomatoes", label: "Tomatoes" },
      { value: "peppers", label: "Peppers" },
      { value: "lettuce", label: "Lettuce" },
      { value: "cabbage", label: "Cabbage" },
      { value: "carrots", label: "Carrots" },
    ]
  },
  {
    category: "Fruits",
    icon: Apple,
    crops: [
      { value: "watermelon", label: "Watermelon" },
      { value: "pineapple", label: "Pineapple" },
      { value: "mango", label: "Mango" },
      { value: "papaya", label: "Papaya" },
      { value: "banana", label: "Banana" },
    ]
  },
  {
    category: "Grains",
    icon: Wheat,
    crops: [
      { value: "maize", label: "Maize (Corn)" },
      { value: "rice", label: "Rice" },
      { value: "sorghum", label: "Sorghum" },
      { value: "millet", label: "Millet" },
    ]
  },
  {
    category: "Cash Crops",
    icon: Leaf,
    crops: [
      { value: "cocoa", label: "Cocoa" },
      { value: "coffee", label: "Coffee" },
      { value: "cashew", label: "Cashew" },
      { value: "cotton", label: "Cotton" },
    ]
  },
]

export function CropInterestForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<CropInterestData>({
    resolver: zodResolver(cropInterestSchema),
    defaultValues: {
      crops: []
    }
  })

  const selectedCrops = watch("crops")

  const onSubmit = async (data: CropInterestData) => {
    setIsLoading(true)
    
    // TODO: Save to user profile
    console.log("Selected crops:", data)
    
    // Navigate to next step
    router.push("/onboarding/newbie/farm-size")
  }

  const handleBack = () => {
    router.push("/onboarding/newbie/farming-experience")
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-6">
        {cropCategories.map((category) => {
          const Icon = category.icon
          return (
            <div key={category.category} className="space-y-3">
              <div className="flex items-center gap-2">
                <Icon className="size-5 text-gray-600" />
                <h3 className="font-medium text-gray-900">{category.category}</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {category.crops.map((crop) => (
                  <ControlledCheckbox
                    key={crop.value}
                    control={control}
                    name="crops"
                    value={crop.value}
                    label={crop.label}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
      
      {errors.crops && (
        <p className="text-sm text-red-500">{errors.crops.message}</p>
      )}
      
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <p className="text-sm text-blue-800">
          {selectedCrops.length > 0 
            ? `You've selected ${selectedCrops.length} crop${selectedCrops.length > 1 ? 's' : ''}` 
            : "Select crops you're interested in growing"}
        </p>
      </div>
      
      <StepNavigation
        onBack={handleBack}
        isFirstStep={false}
        isLoading={isLoading}
        isDisabled={selectedCrops.length === 0}
      />
    </form>
  )
}