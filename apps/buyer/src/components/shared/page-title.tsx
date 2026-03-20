import { cn } from "@/lib/utils";

interface PageTitleProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export function PageTitle({ title, subtitle, className }: PageTitleProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <h2 className="text-xl font-semibold lg:text-2xl">{title}</h2>
      {subtitle ? (
        <p className="text-sm text-muted-foreground lg:text-base">{subtitle}</p>
      ) : null}
    </div>
  );
}
