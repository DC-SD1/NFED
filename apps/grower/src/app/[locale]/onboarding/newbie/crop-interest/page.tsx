import type { Metadata } from "next"

import { ProgressIndicator } from "@/components/auth/progress-indicator"

import { CropInterestForm } from "./crop-interest-form"

export const metadata: Metadata = {
  title: "Crop Interest - CF Grower",
  description: "Choose crops you&apos;re interested in growing",
}

export default function CropInterestPage() {
  return (
    <div className="space-y-6">
      <ProgressIndicator currentStep={3} totalSteps={7} />
      
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          What would you like to grow?
        </h1>
        <p className="text-muted-foreground text-sm">
          Select all crops that interest you
        </p>
      </div>
      
      <CropInterestForm />
    </div>
  )
}