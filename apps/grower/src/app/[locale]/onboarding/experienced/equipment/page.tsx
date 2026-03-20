import type { Metadata } from "next"

import { ProgressIndicator } from "@/components/auth/progress-indicator"

import { EquipmentForm } from "./equipment-form"

export const metadata: Metadata = {
  title: "Farm Equipment - CF Grower",
  description: "What equipment and resources do you have?",
}

export default async function EquipmentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <div className="space-y-6">
      <ProgressIndicator currentStep={6} totalSteps={10} />
      
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          What equipment do you have?
        </h1>
        <p className="text-muted-foreground text-sm">
          Select all equipment and resources available to you
        </p>
      </div>
      
      <EquipmentForm locale={locale} />
    </div>
  )
}