import type { Metadata } from "next"

import { ProgressIndicator } from "@/components/auth/progress-indicator"

import { LearningPreferenceForm } from "./learning-preference-form"

export const metadata: Metadata = {
  title: "Learning Style - CF Grower",
  description: "How do you prefer to learn about farming?",
}

export default function LearningPreferencePage() {
  return (
    <div className="space-y-6">
      <ProgressIndicator currentStep={5} totalSteps={7} />
      
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          How do you prefer to learn?
        </h1>
        <p className="text-muted-foreground text-sm">
          We&apos;ll customize your learning experience
        </p>
      </div>
      
      <LearningPreferenceForm />
    </div>
  )
}