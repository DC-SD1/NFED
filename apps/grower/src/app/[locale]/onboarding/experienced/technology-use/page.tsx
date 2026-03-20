import type { Metadata } from "next"

import { ProgressIndicator } from "@/components/auth/progress-indicator"

import { TechnologyUseForm } from "./technology-use-form"

export const metadata: Metadata = {
  title: "Technology Use - CF Grower",
  description: "What technology do you use in farming?",
}

export default function TechnologyUsePage() {
  return (
    <div className="space-y-6">
      <ProgressIndicator currentStep={8} totalSteps={10} />
      
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          What technology do you use?
        </h1>
        <p className="text-muted-foreground text-sm">
          Select all that apply
        </p>
      </div>
      
      <TechnologyUseForm />
    </div>
  )
}