"use client";

interface Props {
  title: string;
  value: string;
  icon: React.ReactNode;
}

export default function AgentOverviewCard({ title, value, icon: Icon }: Props) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border p-4">
      <div className="flex items-center gap-2.5 py-1">
        <div className="rounded-md bg-[#F3F6F3] p-1.5">{Icon}</div>
        <p className="text-sm">{title}</p>
      </div>
      <div className="py-1">
        <p className="font-bold">{value}</p>
      </div>
    </div>
  );
}
