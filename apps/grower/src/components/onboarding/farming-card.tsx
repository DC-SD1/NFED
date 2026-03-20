import { cn } from "@cf/ui"
import { Badge } from "@cf/ui/components/badge"
import { Check } from "lucide-react"
import Image from "next/image"
import { useTranslations } from "next-intl"

interface FarmingCardProps {
  icon: any;
  label: string;
  value: string;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
  isComingSoon?: boolean;
}

export function FarmingCard(
  {
  icon,
  label,
  selected,
  onClick,
  disabled = false,
  isComingSoon = false,
}: FarmingCardProps) {
  const t = useTranslations("onboarding.newbie.farming-method");

  return (
    <div
      className={cn(
        "relative w-full rounded-xl border transition hover:shadow-md",
        selected && !isComingSoon
          ? "border-primary bg-primary/10 ring-primary ring-2"
          : "border-muted-foreground/40 bg-white",
        (disabled || isComingSoon) && "cursor-not-allowed opacity-60"
      )}
    >
      {isComingSoon && (
        <div className="absolute right-3 top-3 z-10">
          <Badge className="rounded-full bg-blue-500 px-3 py-0.5 text-xs font-semibold text-white">
            {t("coming-soon")}
          </Badge>
        </div>
      )}

      <button
        type="button"
        onClick={onClick}
        disabled={disabled || isComingSoon}
        className="flex w-full items-center justify-between gap-4 p-1.5"
      >
        <div className="flex items-center gap-4">
          <div className="size-[80px]">
            <Image
              src={icon}
              alt={label}
              width={80}
              height={80}
              className="rounded-lg object-cover"
            />
          </div>
          <span className="text-md font-semibold">{label}</span>
        </div>

        {selected && !isComingSoon && (
          <div className="bg-primary absolute right-3 top-3 z-10 rounded-full p-1.5">
            <Check size={10} color="white" />
          </div>
        )}
      </button>
    </div>
  );
}

