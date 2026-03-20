"use client"

import { Button } from "@cf/ui/components/button"
import { Calendar, CreditCard,TrendingUp, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { useOnboarding } from "@/components/onboarding/onboarding-provider"

export function ExperiencedCompleteContent() {
  const router = useRouter()
  const { basicInfo } = useOnboarding()
  const [isLoading, setIsLoading] = useState(false)

  const handleGetStarted = () => {
    setIsLoading(true)
    // TODO: Mark user as onboarded in the database
    router.push("/dashboard")
  }

  const nextSteps = [
    {
      icon: TrendingUp,
      title: "View market insights",
      description: "Real-time prices and demand trends for your crops"
    },
    {
      icon: Users,
      title: "Connect with buyers",
      description: "Access our network of verified produce buyers"
    },
    {
      icon: Calendar,
      title: "Plan next season",
      description: "Use our tools to optimize your crop calendar"
    },
    {
      icon: CreditCard,
      title: "Explore financing",
      description: "Access loans and insurance for your farm"
    },
  ]

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
        <h2 className="mb-2 text-lg font-semibold text-green-900">
          Welcome aboard, {basicInfo.firstName}!
        </h2>
        <p className="text-sm text-green-800">
          Based on your farming experience and goals, we&apos;ve customized CF Grower to help you scale your operations and maximize profits.
        </p>
      </div>
      
      <div className="space-y-4">
        <h3 className="font-medium text-gray-900">What you can do now:</h3>
        <div className="space-y-3">
          {nextSteps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={index} className="flex gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                  <Icon className="size-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">{step.title}</p>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <p className="text-sm text-blue-800">
          <strong>Pro tip:</strong> Start by setting up your farm profile in the dashboard to unlock personalized recommendations and connect with relevant opportunities.
        </p>
      </div>
      
      <div className="space-y-3">
        <Button
          onClick={handleGetStarted}
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Go to dashboard"}
        </Button>
        
        <p className="text-center text-xs text-gray-500">
          You can update your profile anytime from settings
        </p>
      </div>
    </div>
  )
}