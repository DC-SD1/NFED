"use client"

import { Button } from "@cf/ui/components/button"
import { BookOpen, TrendingUp,Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { useOnboarding } from "@/components/onboarding/onboarding-provider"

export function CompleteContent() {
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
      icon: BookOpen,
      title: "Explore learning resources",
      description: "Access beginner-friendly guides and tutorials"
    },
    {
      icon: Users,
      title: "Join the community",
      description: "Connect with other farmers and get support"
    },
    {
      icon: TrendingUp,
      title: "Start your first farm",
      description: "We&apos;ll guide you through setting up your first crop"
    },
  ]

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
        <h2 className="mb-2 text-lg font-semibold text-green-900">
          Congratulations, {basicInfo.firstName}!
        </h2>
        <p className="text-sm text-green-800">
          You&apos;ve completed your profile setup. Based on your responses, we&apos;ve prepared personalized resources to help you succeed in farming.
        </p>
      </div>
      
      <div className="space-y-4">
        <h3 className="font-medium text-gray-900">Here&apos;s what happens next:</h3>
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
      
      <div className="space-y-3">
        <Button
          onClick={handleGetStarted}
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Go to dashboard"}
        </Button>
        
        <p className="text-center text-xs text-gray-500">
          You can always update your profile settings later
        </p>
      </div>
    </div>
  )
}