"use client"

import { ControlledCheckbox } from "@cf/ui/components/controlled-checkbox"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { StepNavigation } from "@/components/auth/step-navigation"

const equipmentSchema = z.object({
  equipment: z.array(z.string()).optional()
})

type EquipmentData = z.infer<typeof equipmentSchema>

const equipmentOptions = [
  {
    category: "Machinery",
    items: [
      { value: "tractor", label: "Tractor" },
      { value: "plough", label: "Plough" },
      { value: "harrow", label: "Harrow" },
      { value: "seeder", label: "Seeder/Planter" },
      { value: "harvester", label: "Harvester" },
      { value: "thresher", label: "Thresher" },
    ]
  },
  {
    category: "Irrigation",
    items: [
      { value: "sprinkler", label: "Sprinkler system" },
      { value: "drip", label: "Drip irrigation" },
      { value: "pump", label: "Water pump" },
      { value: "pipes", label: "Irrigation pipes" },
    ]
  },
  {
    category: "Tools",
    items: [
      { value: "hoe", label: "Hoes" },
      { value: "cutlass", label: "Cutlass/Machete" },
      { value: "wheelbarrow", label: "Wheelbarrow" },
      { value: "sprayer", label: "Knapsack sprayer" },
    ]
  },
  {
    category: "Storage & Processing",
    items: [
      { value: "warehouse", label: "Storage warehouse" },
      { value: "silos", label: "Silos" },
      { value: "drying", label: "Drying facilities" },
      { value: "processing", label: "Processing equipment" },
    ]
  },
  {
    category: "Transportation",
    items: [
      { value: "truck", label: "Truck" },
      { value: "van", label: "Van" },
      { value: "motorcycle", label: "Motorcycle" },
      { value: "bicycle", label: "Bicycle" },
    ]
  },
]

export function EquipmentForm({ locale }: { locale: string }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<EquipmentData>({
    resolver: zodResolver(equipmentSchema),
    defaultValues: {
      equipment: []
    }
  })

  const selectedEquipment = watch("equipment") || []

  const onSubmit = async (data: EquipmentData) => {
    setIsLoading(true)
    
    // TODO: Save to user profile
    console.log("Equipment:", data)
    
    // Navigate to next step
    router.push(`/${locale}/onboarding/experienced/market-access`)
  }

  const handleBack = () => {
    router.push(`/${locale}/onboarding/experienced/challenges`)
  }

  const handleSkip = () => {
    router.push(`/${locale}/onboarding/experienced/market-access`)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-6">
        {equipmentOptions.map((category) => (
          <div key={category.category} className="space-y-3">
            <h3 className="font-medium text-gray-900">{category.category}</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {category.items.map((item) => (
                <ControlledCheckbox
                  key={item.value}
                  control={control}
                  name="equipment"
                  value={item.value}
                  label={item.label}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {errors.equipment && (
        <p className="text-sm text-red-500">{errors.equipment.message}</p>
      )}
      
      <div className="rounded-lg bg-gray-50 p-4">
        <p className="text-sm text-gray-700">
          {selectedEquipment.length > 0 
            ? `You've selected ${selectedEquipment.length} item${selectedEquipment.length > 1 ? 's' : ''}` 
            : "Select equipment you own or have access to"}
        </p>
      </div>
      
      <StepNavigation
        onBack={handleBack}
        onSkip={handleSkip}
        showSkip={true}
        skipLabel="Skip this step"
        isFirstStep={false}
        isLoading={isLoading}
      />
    </form>
  )
}