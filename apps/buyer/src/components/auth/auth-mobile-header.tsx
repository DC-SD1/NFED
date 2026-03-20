import { cn } from "@cf/ui/utils/cn"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface AuthMobileHeaderProps {
  title?: string
  showBackButton?: boolean
  backHref?: string
  className?: string
}

export function AuthMobileHeader({
  title = "CF Grower",
  showBackButton = true,
  backHref = "/",
  className
}: AuthMobileHeaderProps) {
  return (
    <div className={cn(
      "flex items-center justify-between border-b p-4 lg:hidden",
      className
    )}>
      {showBackButton && (
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="size-4" />
          <span className="hidden sm:inline">Back</span>
        </Link>
      )}
      
      <div className={cn(
        "flex items-center gap-2",
        !showBackButton && "ml-auto"
      )}>
        <div className="bg-primary flex size-8 items-center justify-center rounded-lg">
          <span className="text-sm font-bold text-white">CF</span>
        </div>
        <span className="font-semibold text-gray-900">{title}</span>
      </div>
    </div>
  )
}