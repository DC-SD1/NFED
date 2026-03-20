import type { Metadata } from "next";

import { ProgressIndicator } from "@/components/auth/progress-indicator";

import { ChallengesForm } from "./challenges-form";

export const metadata: Metadata = {
  title: "Farming Challenges - CF Grower",
  description: "What challenges do you face in farming?",
};

export default async function ChallengesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: _ } = await params;

  return (
    <div className="space-y-6">
      <ProgressIndicator currentStep={5} totalSteps={10} />

      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          What challenges do you face?
        </h1>
        <p className="text-muted-foreground text-sm">
          Select your top challenges so we can help
        </p>
      </div>

      <ChallengesForm />
    </div>
  );
}
