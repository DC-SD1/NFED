import type { Metadata } from "next"

import { ProgressIndicator } from "@/components/auth/progress-indicator"

import { FarmSizeForm } from "./farm-size-form"

export const metadata: Metadata = {
  title: "Farm Size - CF Grower",
  description: "Tell us about your available farming space",
}

export default function FarmSizePage() {
  return (
    <div className="space-y-6">
      <ProgressIndicator currentStep={4} totalSteps={7} />
      
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          How much space do you have?
        </h1>
        <p className="text-muted-foreground text-sm">
          This helps us recommend suitable crops and techniques
        </p>
      </div>
      
      <FarmSizeForm />
    </div>
  )
}