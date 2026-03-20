"use client"

import { ControlledCheckbox } from "@cf/ui/components/controlled-checkbox"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { StepNavigation } from "@/components/auth/step-navigation"

const servicesSchema = z.object({
  services: z.array(z.string()).min(1, "Please select at least one service")
})

type ServicesData = z.infer<typeof servicesSchema>

const serviceOptions = [
  {
    category: "Farm Management",
    services: [
      { value: "crop_planning", label: "Crop planning & scheduling" },
      { value: "farm_records", label: "Digital farm records" },
      { value: "expense_tracking", label: "Expense & income tracking" },
      { value: "yield_prediction", label: "Yield prediction & analytics" },
    ]
  },
  {
    category: "Market Services",
    services: [
      { value: "buyer_matching", label: "Buyer matching" },
      { value: "price_alerts", label: "Market price alerts" },
      { value: "contract_farming", label: "Contract farming opportunities" },
      { value: "export_support", label: "Export market support" },
    ]
  },
  {
    category: "Financial Services",
    services: [
      { value: "loans", label: "Access to farm loans" },
      { value: "insurance", label: "Crop insurance" },
      { value: "savings", label: "Savings programs" },
      { value: "payments", label: "Digital payments" },
    ]
  },
  {
    category: "Support Services",
    services: [
      { value: "expert_advice", label: "Expert agronomist support" },
      { value: "training", label: "Training & workshops" },
      { value: "input_supply", label: "Quality input supply" },
      { value: "equipment_rental", label: "Equipment rental" },
    ]
  },
]

export function ServicesInterestForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<ServicesData>({
    resolver: zodResolver(servicesSchema),
    defaultValues: {
      services: []
    }
  })

  const selectedServices = watch("services")

  const onSubmit = async (data: ServicesData) => {
    setIsLoading(true)
    
    // TODO: Save to user profile and complete onboarding
    console.log("Services interest:", data)
    
    // Navigate to completion
    router.push("/onboarding/experienced/complete")
  }

  const handleBack = () => {
    router.push("/onboarding/experienced/goals")
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-6">
        {serviceOptions.map((category) => (
          <div key={category.category} className="space-y-3">
            <h3 className="font-medium text-gray-900">{category.category}</h3>
            <div className="space-y-2">
              {category.services.map((service) => (
                <div key={service.value} className="rounded-lg border p-3 hover:bg-gray-50">
                  <ControlledCheckbox
                    control={control}
                    name="services"
                    value={service.value}
                    label={service.label}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {errors.services && (
        <p className="text-sm text-red-500">{errors.services.message}</p>
      )}
      
      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
        <p className="text-sm text-green-800">
          {selectedServices.length > 0 
            ? `Great! We'll customize your experience for ${selectedServices.length} service${selectedServices.length > 1 ? 's' : ''}.` 
            : "Select services you'd like to explore on CF Grower"}
        </p>
      </div>
      
      <StepNavigation
        onBack={handleBack}
        isFirstStep={false}
        isLoading={isLoading}
        isDisabled={selectedServices.length === 0}
        nextLabel="Complete setup"
      />
    </form>
  )
}