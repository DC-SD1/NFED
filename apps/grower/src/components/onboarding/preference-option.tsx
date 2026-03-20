import { cn } from "@cf/ui"
import { Checkbox } from "@cf/ui/components/checkbox"

interface OptionProps<T extends string | number> {
  label: string
  value: T
  selected: boolean
  onSelect: (value: T) => void
}

export function PreferenceOption<T extends string | number>({
  label,
  value,
  selected,
  onSelect
}: OptionProps<T>) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    onSelect(value)
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleClick(e as any)
        }
      }}
      className={cn(
        "mb-3 flex w-full cursor-pointer items-center justify-start gap-3 rounded-xl border p-4 text-left focus:outline-none",
        selected
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/20 bg-card"
      )}
    >
      <Checkbox checked={selected} className="rounded-full border-gray-300" />
      <span
        className={cn(
          "text-base",
          selected ? "text-foreground font-medium" : "text-muted-foreground"
        )}
      >
        {label}
      </span>
    </div>
  )
}
