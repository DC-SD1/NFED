import type { Metadata } from "next"

import { ProgressIndicator } from "@/components/auth/progress-indicator"

import { ServicesInterestForm } from "./services-interest-form"

export const metadata: Metadata = {
  title: "Services Interest - CF Grower",
  description: "Which CF Grower services interest you?",
}

export default function ServicesInterestPage() {
  return (
    <div className="space-y-6">
      <ProgressIndicator currentStep={10} totalSteps={10} />
      
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          Which services interest you?
        </h1>
        <p className="text-muted-foreground text-sm">
          We&apos;ll prioritize these in your dashboard
        </p>
      </div>
      
      <ServicesInterestForm />
    </div>
  )
}