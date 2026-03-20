"use client"

import { Button } from "@cf/ui/components/button"
import { ChevronLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export function MobileAuthHeader() {
  const router = useRouter()

  return (
    <div className="border-b p-6 lg:hidden">
      <div className="mb-4 flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="text-primary h-auto p-0 hover:bg-transparent"
        >
          <ChevronLeft className="mr-1 size-5" />
          Back
        </Button>
      </div>
      <div className="flex items-center justify-center gap-2">
        <div className="bg-primary flex size-8 items-center justify-center rounded-lg">
          <span className="text-lg font-bold text-white">C</span>
        </div>
        <span className="text-primary text-xl font-semibold">CF Grower</span>
      </div>
    </div>
  )
}