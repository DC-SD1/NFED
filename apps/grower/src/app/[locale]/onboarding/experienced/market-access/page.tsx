import type { Metadata } from "next"

import { ProgressIndicator } from "@/components/auth/progress-indicator"

import { MarketAccessForm } from "./market-access-form"

export const metadata: Metadata = {
  title: "Market Access - CF Grower",
  description: "How do you currently sell your produce?",
}

export default function MarketAccessPage() {
  return (
    <div className="space-y-6">
      <ProgressIndicator currentStep={7} totalSteps={10} />
      
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          How do you sell your produce?
        </h1>
        <p className="text-muted-foreground text-sm">
          Select all channels you currently use
        </p>
      </div>
      
      <MarketAccessForm />
    </div>
  )
}