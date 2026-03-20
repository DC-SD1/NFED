"use client";

interface Props {
  title: string;
  value: string;
  subTitle: string;
  icon: React.ComponentType<{ className?: string }>;
}

export default function GrowerOverviewCard({
  title,
  value,
  subTitle,
  icon: Icon,
}: Props) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border p-4">
      <div className="flex items-center justify-between py-1">
        <p className="text-sm">{title}</p>
        <div className="rounded-md bg-[#F3F6F3] p-1.5">
          <Icon className="text-secondary-foreground size-4" />
        </div>
      </div>
      <div className="py-1">
        <p className="font-bold">{value}</p>
      </div>
      <div className="py-1">
        <p className="truncate text-sm">{subTitle}</p>
      </div>
    </div>
  );
}
